import axios from "axios"
import { HttpErrors } from "./http.errors";

export const parseError = (error: any) => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return error.response.data || HttpErrors[error.response.status]
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            return error.toString();
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            return error.message;
            console.log('Error', error.message);
        }
    } else {
        return error.toString()
    }
}