"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./src/db/config");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield config_1.poolPromise;
        try {
            yield pool.request().query('ALTER TABLE TeleradiologyCompany ADD Settings NVARCHAR(MAX) NULL');
            console.log('Added Settings to TeleradiologyCompany');
        }
        catch (e) {
            console.log(e.message);
        }
        try {
            yield pool.request().query('ALTER TABLE Hospital ADD Settings NVARCHAR(MAX) NULL');
            console.log('Added Settings to Hospital');
        }
        catch (e) {
            console.log(e.message);
        }
        process.exit(0);
    });
}
run();
