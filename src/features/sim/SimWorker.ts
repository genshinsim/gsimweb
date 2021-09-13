import { simConfig } from './simSlice'
import './workerHack'


let url = process.env.PUBLIC_URL + "/wasm_exec.js"
// @ts-ignore
importScripts(url)


if (!WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

// @ts-ignore
const go = new Go();
url = process.env.PUBLIC_URL + "/sim.wasm"
let inst;
WebAssembly.instantiateStreaming(fetch(url), go.importObject).then((result) => {
    inst = result.instance;
    go.run(inst);
    console.log("ok")
}).catch((err) => {
    console.error(err);
});


declare function sim(
    content: string,
    callback: (err: string, data: string) => void,
    update: (count: number) => void,
    debug: (msg: string) => void,
): void;

let debug: string
let percent: number

const saveDebug = (msg: string) => {
    debug += msg
}

onmessage = async (ev: { data: simConfig }) => {
    const t1 = performance.now()
    console.log('starting: ', t1)

    let n = ev.data.options.iter


    debug = ""
    percent = 0
    const cb = (err: string, data: string) => {
        // if (debug !== "") {
        //     debug = debug.replace('undefined', '')
        // }
        postMessage({
            isUpdate: false,
            percent: 100,
            err: err,
            data: data,
            debug: debug,
        } as {
            isUpdate: boolean;
            percent: number;
            err: string;
            data: string;
            debug: string;
        }, undefined as any)
        console.log("sim all done")
        // console.log(debug)
    }
    const onUpdate = (count: number) => {
        console.log("done #", count, " percent", count / n, " rounded ", Math.floor(100 * count / n), " last ", percent)
        //every 1%
        if (Math.floor(100 * count / n) > percent) {
            percent = Math.floor(100 * count / n);
            postMessage({
                isUpdate: true,
                percent: percent,
                err: "",
                data: "",
                debug: "",
            } as {
                isUpdate: boolean;
                percent: number;
                err: string;
                data: string;
                debug: string;
            }, undefined as any)
        }

    }

    sim(
        JSON.stringify(ev.data),
        cb,
        onUpdate,
        saveDebug
    )

    let t2 = performance.now()

    console.log("finished at ", t2, " took: ", t2 - t1)
}