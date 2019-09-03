import {useReducer,useCallback} from 'react'
const initialState = {
    loading: false,
    error: null,
    data:null,
    extra: null,
    identifier:null
  }
const httpReducer = (currentHttpState, action) => {
    switch (action.type) {
      case "SEND":
        return { loading: true, error: null,data:null,extra:null,identifier:action.identifier };
      case "RESPONSE":
        return { ...currentHttpState,loading: false,data: action.data,extra:action.extra};
      case "ERROR":
        return { loading: false, error: action.error };
      case "CLEAR":
        return initialState;
      default:
        throw new Error("Should not happen");
    }
  };
const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);
     const clear = useCallback(() => {
        dispatchHttp({
            type: "CLEAR"
          });
     },[])
    const sendRequest = useCallback(async (url,method,body,extra,identifier) => {
        try {
            dispatchHttp({
              type: "SEND",
              identifier:identifier
            });
            const jsonData = await fetch(
                url,
              {
                method: method,
                body:body,
                headers:{
                    'Content-Type':'application/json'
                }
              }
            ).then(res => res.json());

            dispatchHttp({
              type: "RESPONSE",
              data:jsonData,
              extra
            });
            
          } catch (err) {
            dispatchHttp({
              type: "ERROR",
              error: "Something went wrong..."
            });
          }
      },[])
    return {
        isLoading:httpState.loading,
        data:httpState.data,
        error: httpState.error,
        sendRequest:sendRequest,
        extra: httpState.extra,
        identifier:httpState.identifier,
        clear:clear
    }
}

export default useHttp;