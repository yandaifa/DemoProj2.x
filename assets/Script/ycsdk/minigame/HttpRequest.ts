export enum ContentType {
    APPLICATION_JSON = "application/json",
    APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded"
}

export default class HttpRequest {
    private static instance: HttpRequest
    private httpRequest: XMLHttpRequest
    public static AUTHORIZATION: string = "Authorization"
    public static CONTENT_TYPE: string = "Content-Type"
    public static Accept: string = "Accept"

    public static get(): HttpRequest {
        if (!HttpRequest.instance) {
            HttpRequest.instance = new HttpRequest()
        }
        return HttpRequest.instance
    }

    requestPostx3w(url, data, callback, head?) {
        console.log("HttpRequest url:", url)
        console.log("HttpRequest data:", JSON.stringify(data))
        this.httpRequest = new XMLHttpRequest()
        this.httpRequest.onreadystatechange = function () {
            console.log("HttpRequest", "onreadystatechange:", this.readyState, this.status)
            if (this.readyState == 4 && this.status == 200) {
                // let response = this.responseText.replace(/:s*([0-9]{15,})s*(,?)/g, ': "$1" $2')
                let res = JSON.parse(this.responseText)
                console.log("HttpRequest", "response:", JSON.stringify(res))
                if (res.status == 200) {
                    callback(true, res.data)
                } else {
                    callback(false, res)
                }
            }
        }
        this.httpRequest.timeout = 5000
        this.httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        this.httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        this.httpRequest.open("POST", url, true)
        this.httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_X_WWW_FORM_URLENCODED)
        if (head) {
            this.httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        }
        this.httpRequest.send(data)
    }

    requestGetx3w(url, data, callback, head?) {
        console.log("HttpRequest url:", url)
        console.log("HttpRequest data:", JSON.stringify(data))
        this.httpRequest = new XMLHttpRequest()
        this.httpRequest.onreadystatechange = function () {
            // console.log("HttpRequest", "onreadystatechange:", this.readyState, this.status)
            if (this.readyState == 4 && this.status == 200) {
                let response = this.responseText.replace(/:s*([0-9]{15,})s*(,?)/g, ': "$1" $2')
                let res = JSON.parse(response)
                console.log("HttpRequest", "response:", JSON.stringify(res))
                if (res.status == 200) {
                    callback(true, res.data)
                } else {
                    callback(false, res)
                }
            }
        }
        this.httpRequest.timeout = 5000
        this.httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        this.httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        this.httpRequest.open("GET", url, true)
        this.httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_X_WWW_FORM_URLENCODED)
        if (head) {
            this.httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        }
        this.httpRequest.send(data)
    }

    requestPostjson(url, data, callback, head?) {
        console.log("HttpRequest url:", url)
        this.httpRequest = new XMLHttpRequest()
        this.httpRequest.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let res = JSON.parse(this.responseText)
                console.log("HttpRequest", "response:", JSON.stringify(res))
                if (res.code == 0) {
                    callback(true, res.data.config)
                } else {
                    callback(false, res)
                }
            }
        }
        this.httpRequest.timeout = 3000
        this.httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        this.httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        this.httpRequest.open("POST", url, true)
        this.httpRequest.setRequestHeader(HttpRequest.Accept, ContentType.APPLICATION_JSON)
        this.httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_JSON)
        // if (head) {
        //     this.httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        // }
        this.httpRequest.send(JSON.stringify(data))
    }
}

