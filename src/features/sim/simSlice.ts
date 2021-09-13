// import { Intent, Position, Toaster } from "@blueprintjs/core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { sendMessage } from "app/appSlice";
import { AppThunk } from "app/store";
import { setActiveName, setLogs, setNames } from "features/debug/debugSlice";
import { setResultData } from "features/results/resultsSlice";
// eslint-disable-next-line
import Worker from "worker-loader!./SimWorker";

// export function saveConfig(path: string, config: string): AppThunk {
//   return function (dispatch) {
//     const cb = (resp: any) => {
//       //check resp code
//       if (resp.status !== 200) {
//         //do something here
//         console.log("Error from server: ", resp.payload);
//         return;
//       }
//       //update
//       dispatch(setHasChange(false));
//       console.log(resp.data);
//     };

//     dispatch(
//       sendMessage(
//         "file",
//         "save/file",
//         JSON.stringify({
//           path: path,
//           data: config,
//         }),
//         cb
//       )
//     );
//   };
// }



const worker: Worker = new Worker()

export function runSim(config: simConfig): AppThunk {
  return function (dispatch, getState) {

    worker.onmessage = (e: {
      data: {
        isUpdate: boolean;
        percent: number;
        err: string;
        data: string;
        debug: string;
      }
    }) => {
      // console.log(e.data.err)
      // console.log(e.data.data)

      if (e.data.isUpdate) {
        dispatch(setPercent(e.data.percent))
        return
      }

      dispatch(setLoading(false));
      if (e.data.err == null) {
        let r = JSON.parse(e.data.data)
        dispatch(setResultData(r));
        if (e.data.debug !== "") {
          dispatch(setLogs(e.data.debug));
          dispatch(setNames(r.char_names));
        }
        dispatch(setMessage("Simulation finished. check results"));
      } else {
        dispatch(setMessage("Sim encountered error: " + e.data.err));
        dispatch(setHasErr(true));
        console.log("err: ", e.data.err)
      }
    }


    dispatch(setLoading(true));
    dispatch(setResultData(null));
    dispatch(setLogs(""));
    dispatch(setNames([]));
    dispatch(setMessage(""));
    dispatch(setHasErr(false));
    dispatch(setPercent(0))

    //find out who the active is
    const found = config.config.match(/active\+=(\w+);/);
    if (found) {
      dispatch(setActiveName(found[1]));
    }

    worker.postMessage(config)



  };
}

export interface simConfig {
  config: string;
  options: {
    log_details: boolean;
    debug: boolean;
    iter: number;
    workers: number;
    duration: number;
  };
}

export interface ICharacter {
  name: string;
  ascension: number; // 0 to 6
  level: number;
  constellation: number; // 0 to 6
  talents: {
    auto: number,
    skill: number,
    burst: number,
  }
  stats: number[];
}

export interface IArtifact {
  stats: number[];
}

interface SimState {
  isLoading: boolean;
  config: string;
  hasChange: boolean;
  msg: string;
  hasErr: boolean;
  percent: number;
}
const initialState: SimState = {
  isLoading: false,
  config: "",
  hasChange: false,
  msg: "",
  hasErr: false,
  percent: 0,
};

export const simSlice = createSlice({
  name: "sim",
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<string>) => {
      state.config = action.payload;
      localStorage.setItem("sim-config", action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHasChange: (state, action: PayloadAction<boolean>) => {
      state.hasChange = action.payload;
    },
    setMessage: (state, action: PayloadAction<string>) => {
      state.msg = action.payload;
    },
    setHasErr: (state, action: PayloadAction<boolean>) => {
      state.hasErr = action.payload;
    },
    setPercent: (state, action: PayloadAction<number>) => {
      state.percent = action.payload;
    }
  },
});

export const { setConfig, setLoading, setHasChange, setMessage, setHasErr, setPercent } =
  simSlice.actions;
export default simSlice.reducer;
