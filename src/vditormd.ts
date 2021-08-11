import * as vscode from 'vscode';

export class VditormdProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new VditormdProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(VditormdProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'md.vditor';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        const receive = webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'change':
                    this.change(document, e.text);
                    return;
            }
        });

        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            receive.dispose();
        });

        updateWebview();
    }

    change(document: vscode.TextDocument, text: any) {
        const edit = new vscode.WorkspaceEdit();

        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), text);

        return vscode.workspace.applyEdit(edit);
    }

    updateTextDocument(document: vscode.TextDocument, text: any) {
        try {
            vscode.workspace.fs.writeFile(document.uri, Buffer.from(text));
        }
        catch (e) {
            console.log(e);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'vditor.js'));
        const scriptUri2 = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'vditormd.js'));

        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'vditor.css'));
        const styleUri2 = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'asset', 'vditormd.css'));

        return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet" />
				<link href="${styleUri2}" rel="stylesheet" />
			</head>
			<body >	
            <div id="vditor"  class="vditor vditor--fullscreen">
            </div>
				<script  src="${scriptUri}"></script>
				<script  src="${scriptUri2}"></script>
			</body>
			</html>`;
    }
}