let x: any = undefined;
let counter = 0;


if (document.getElementById('bbb')) {
    document.getElementById('bbb').addEventListener('click', checkLogStringUrl);
}

function checkLogStringUrl() {
    console.log('called');
    if (!x) {
        x = setInterval(() => {
            counter++;
            if (counter > 50) {
                counter = 0;
                clearInterval(x)
            }
            fetch(window.location.origin + '/outputStreamUrl')
                .then(res => res.json()).then(res => {
                if (res.outputStreamUrl) {
                    clearInterval(x);
                    document.getElementById('bbb').setAttribute('disabled', 'true');
                    getData(res.outputStreamUrl);
                }
            })
        }, 2000)
    }
}

function getData(url: string) {
    document.getElementById("outLog").innerText += 'Deploying, hold tight \n';
    fetch(url).then(r => r.body).then(body => {
        const reader = body.getReader();
        return new ReadableStream({
            start(controller) {
                return pump();

                function pump(): any {
                    return reader.read().then(({done, value}) => {
                        // When no more data needs to be consumed, close the stream
                        if (done) {

                            // add env vars
                            document.getElementById("outLog").innerText += '\n Adding env variables \n';

                            fetch(window.location.origin + '/addEnvVars', {method: 'POST'})
                                .then(r => r.json())
                                .then(r => {
                                    document.getElementById("outLog").innerText += '\n Done! \n';
                                    let x = document.createElement('a');
                                    x.href = 'https://' + r.data + '.herokuapp.com';
                                    x.style.fontSize = '5rem';
                                    x.innerText = 'Deploy DONE! go to ' + r.data;
                                    document.getElementById("outLog").appendChild(x);
                                    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
                                });
                            controller.close();
                            return;
                        }
                        // Enqueue the next data chunk into our target stream
                        controller.enqueue(value);
                        document.getElementById("outLog").innerText += new TextDecoder("utf-8").decode(value);
                        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
                        return pump();
                    });
                }
            }
        })
    }).catch(err => console.error(err))
}

checkLogStringUrl();
