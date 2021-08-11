// @ts-check

// Script run within the webview itself.
(function () {
    // @ts-ignore
    let vscode = acquireVsCodeApi();




    // @ts-ignore
    let vditor = new Vditor("vditor", {
    });



    let value = '';

    function debounce() {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (value != vditor.getValue()) {
                    value = vditor.getValue();
                    vscode.postMessage({ type: "change", text: vditor.getValue() });
                }
            }, 250);
        };
    }

    var ele = document.getElementById("vditor");
    ele.addEventListener("keypress", debounce())

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                const text = message.text;
                vditor.setValue(text);
                value = text;
                return;
        }
    });
}());