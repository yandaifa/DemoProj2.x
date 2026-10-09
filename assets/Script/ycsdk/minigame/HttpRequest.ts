export enum ContentType {
    APPLICATION_JSON = "application/json",
    APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded"
}

export default class HttpRequest {
    private static instance: HttpRequest
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
        console.log("HttpRequest data:", data)
        let httpRequest = new XMLHttpRequest()
        httpRequest.onreadystatechange = function () {
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
        httpRequest.timeout = 5000
        httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        httpRequest.open("POST", url, true)
        httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_X_WWW_FORM_URLENCODED)
        if (head) {
            httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        }
        httpRequest.send(data)
    }

    requestGetx3w(url, data, callback, head?) {
        console.log("HttpRequest url:", url)
        console.log("HttpRequest data:", JSON.stringify(data))
        let httpRequest = new XMLHttpRequest()
        httpRequest.onreadystatechange = function () {
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
        httpRequest.timeout = 5000
        httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        httpRequest.open("GET", url, true)
        httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_X_WWW_FORM_URLENCODED)
        if (head) {
            httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        }
        httpRequest.send(data)
    }

    requestPostjson(url, data, callback, head?) {
        // console.log("HttpRequest url:", url)
        // console.log("HttpRequest data:", data)
        let httpRequest = new XMLHttpRequest()
        httpRequest.timeout = 3000
        httpRequest.onreadystatechange = function () {
            if (this.readyState != 4) return
            console.log("HttpRequest readyState=4 status:", this.status)
            // 部分小游戏容器用 status 0 表示请求成功
            if (this.status == 200 || this.status == 0) {
                let res
                try {
                    res = JSON.parse(this.responseText)
                } catch (e) {
                    console.log("HttpRequest response parse error:", e, "response:", this.responseText)
                    callback(false, this.responseText)
                    return
                }
                console.log("HttpRequest", "response:", JSON.stringify(res))
                if (res.code == 0) {
                    callback(true, res.data.config)
                } else {
                    callback(false, res)
                }
            } else {
                // 非 200 也必须回调并把响应体带回，避免请求“无声失败”（如 401）
                let errBody: any = this.responseText || ""
                try {
                    errBody = JSON.parse(errBody)
                } catch (e) {
                    // 保留原文
                }
                console.log("HttpRequest error status:", this.status, errBody)
                callback(false, errBody)
            }
        }
        httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        httpRequest.onabort = function () {
            console.log("HttpRequest", url, " request abort")
            callback(false)
        }
        httpRequest.open("POST", url, true)
        httpRequest.setRequestHeader(HttpRequest.Accept, ContentType.APPLICATION_JSON)
        httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_JSON)
        // if (head) {
        //     httpRequest.setRequestHeader(HttpRequest.AUTHORIZATION, head)
        // }
        httpRequest.send(JSON.stringify(data))
    }

    requestPostjson2(url, data, callback, head?) {
        // console.log("HttpRequest url:", url)
        // console.log("HttpRequest data:", data)
        // console.log("HttpRequest head:", head)
        let httpRequest = new XMLHttpRequest()
        httpRequest.timeout = 5000
        httpRequest.onreadystatechange = function () {
            if (this.readyState != 4) return
            // console.log("HttpRequest readyState=4 status:", this.status)
            if (this.status == 200 || this.status == 0) {
                let res
                try {
                    res = JSON.parse(this.responseText)
                } catch (e) {
                    // console.log("HttpRequest response parse error:", e, "response:", this.responseText)
                    callback(false, this.responseText)
                    return
                }
                // console.log("HttpRequest", "response:", JSON.stringify(res))
                if (res.code == 200) {
                    callback(true, res.data)
                } else {
                    callback(false, res)
                }
            } else {
                // 非 200 也必须回调并把响应体带回，避免请求“无声失败”（如 401）
                let errBody: any = this.responseText || ""
                try {
                    errBody = JSON.parse(errBody)
                } catch (e) {
                    // 保留原文
                }
                // console.log("HttpRequest error status:", this.status, errBody)
                callback(false, errBody)
            }
        }
        httpRequest.ontimeout = () => {
            console.log("HttpRequest:", "request time out", url)
            callback(false)
        }
        httpRequest.onerror = function (e) {
            console.log("HttpRequest", url, " request error", JSON.stringify(e))
            callback(false)
        }
        httpRequest.onabort = function () {
            console.log("HttpRequest", url, " request abort")
            callback(false)
        }
        httpRequest.open("POST", url, true)
        httpRequest.setRequestHeader(HttpRequest.Accept, ContentType.APPLICATION_JSON)
        httpRequest.setRequestHeader(HttpRequest.CONTENT_TYPE, ContentType.APPLICATION_JSON)
        if (head) {
            for (const key in head) {
                httpRequest.setRequestHeader(key, head[key])
            }
        }
        httpRequest.send(data)
    }
}

