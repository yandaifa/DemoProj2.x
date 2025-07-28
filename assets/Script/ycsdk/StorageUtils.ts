export class StorageUtils{


        static setStringData(key: string, value: string): void {
            if (key == "" || value == "") return;
            if (typeof value != "string") value = JSON.stringify(value);
            cc.sys.localStorage.setItem(key, value);
        }
       
        static getStringData(key: string): string {
            let value = cc.sys.localStorage.getItem(key);
            if (value == "" || value == undefined || value == null) value = "";
            return value;
        }

        static setBooleanData(key: string, value: boolean): void {
            cc.sys.localStorage.setItem(key, value);
        }
       
        static getBooleanData(key: string): boolean {
            let value = cc.sys.localStorage.getItem(key);
            if (value == "" || value == undefined || value == null) value = false;
            return value;
        }
}