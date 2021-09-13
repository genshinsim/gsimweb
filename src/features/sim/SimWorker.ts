import { simConfig } from './simSlice'
import './workerHack'
import 'wasm/wasm_exec'


if (!WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

// @ts-ignore
const go = new Go();
console.log(process.env.PUBLIC_URL)
let url = process.env.PUBLIC_URL + "/sim.wasm"
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
): void;

onmessage = async (ev: { data: simConfig }) => {
    const t1 = performance.now()
    console.log('starting: ', t1)
    const cb = (err: string, data: string) => {
        postMessage({
            err: err,
            data: data,
        } as { err: string; data: string }, undefined as any)
    }
    const onUpdate = (count: number) => {
        console.log("done #", count)
    }
    sim(
        JSON.stringify(ev.data),
        cb,
        onUpdate
    )

    let t2 = performance.now()

    console.log("finished at ", t2, " took: ", t2 - t1)

}