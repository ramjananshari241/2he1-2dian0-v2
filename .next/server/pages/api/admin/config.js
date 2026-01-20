"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/admin/config";
exports.ids = ["pages/api/admin/config"];
exports.modules = {

/***/ "@notionhq/client":
/*!***********************************!*\
  !*** external "@notionhq/client" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@notionhq/client");

/***/ }),

/***/ "(api)/./src/pages/api/admin/config.js":
/*!***************************************!*\
  !*** ./src/pages/api/admin/config.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _notionhq_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @notionhq/client */ \"@notionhq/client\");\n/* harmony import */ var _notionhq_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_notionhq_client__WEBPACK_IMPORTED_MODULE_0__);\n\nasync function handler(req, res) {\n    // 1. 初始化 Notion 客户端\n    const notion = new _notionhq_client__WEBPACK_IMPORTED_MODULE_0__.Client({\n        auth: process.env.NOTION_TOKEN || process.env.NOTION_KEY\n    });\n    const databaseId = process.env.NOTION_PAGE_ID || process.env.NOTION_DATABASE_ID;\n    try {\n        // 2. 获取数据库信息\n        const response = await notion.databases.retrieve({\n            database_id: databaseId\n        });\n        const title = response.title?.[0]?.plain_text || \"PROBLOG\";\n        // 3. 成功返回 (状态码 200)\n        res.status(200).json({\n            success: true,\n            siteInfo: {\n                title\n            }\n        });\n    } catch (error) {\n        console.error(\"Config API Error:\", error);\n        // 4. 失败返回 (状态码 500)\n        res.status(500).json({\n            success: false,\n            error: error.message\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL2FkbWluL2NvbmZpZy5qcy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMEM7QUFFM0IsZUFBZUMsUUFBUUMsR0FBRyxFQUFFQyxHQUFHLEVBQUU7SUFDOUMsb0JBQW9CO0lBQ3BCLE1BQU1DLFNBQVMsSUFBSUosb0RBQU1BLENBQUM7UUFDeEJLLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsWUFBWSxJQUFJRixRQUFRQyxHQUFHLENBQUNFLFVBQVU7SUFDMUQ7SUFDQSxNQUFNQyxhQUFhSixRQUFRQyxHQUFHLENBQUNJLGNBQWMsSUFBSUwsUUFBUUMsR0FBRyxDQUFDSyxrQkFBa0I7SUFFL0UsSUFBSTtRQUNGLGFBQWE7UUFDYixNQUFNQyxXQUFXLE1BQU1ULE9BQU9VLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDO1lBQUVDLGFBQWFOO1FBQVc7UUFDM0UsTUFBTU8sUUFBUUosU0FBU0ksS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFQyxjQUFjO1FBRWpELG9CQUFvQjtRQUNwQmYsSUFBSWdCLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUyxJQUFJO1lBQUVDLFVBQVU7Z0JBQUVMO1lBQU07UUFBRTtJQUM1RCxFQUFFLE9BQU9NLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLHFCQUFxQkE7UUFDbkMsb0JBQW9CO1FBQ3BCcEIsSUFBSWdCLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsU0FBUyxLQUFLO1lBQUVFLE9BQU9BLE1BQU1FLE9BQU87UUFBQztJQUM5RDtBQUNGLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hbnppZmFuLmNvbS8uL3NyYy9wYWdlcy9hcGkvYWRtaW4vY29uZmlnLmpzP2U5NTkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAnQG5vdGlvbmhxL2NsaWVudCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XHJcbiAgLy8gMS4g5Yid5aeL5YyWIE5vdGlvbiDlrqLmiLfnq69cclxuICBjb25zdCBub3Rpb24gPSBuZXcgQ2xpZW50KHtcclxuICAgIGF1dGg6IHByb2Nlc3MuZW52Lk5PVElPTl9UT0tFTiB8fCBwcm9jZXNzLmVudi5OT1RJT05fS0VZLFxyXG4gIH0pO1xyXG4gIGNvbnN0IGRhdGFiYXNlSWQgPSBwcm9jZXNzLmVudi5OT1RJT05fUEFHRV9JRCB8fCBwcm9jZXNzLmVudi5OT1RJT05fREFUQUJBU0VfSUQ7XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyAyLiDojrflj5bmlbDmja7lupPkv6Hmga9cclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbm90aW9uLmRhdGFiYXNlcy5yZXRyaWV2ZSh7IGRhdGFiYXNlX2lkOiBkYXRhYmFzZUlkIH0pO1xyXG4gICAgY29uc3QgdGl0bGUgPSByZXNwb25zZS50aXRsZT8uWzBdPy5wbGFpbl90ZXh0IHx8ICdQUk9CTE9HJztcclxuICAgIFxyXG4gICAgLy8gMy4g5oiQ5Yqf6L+U5ZueICjnirbmgIHnoIEgMjAwKVxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdWNjZXNzOiB0cnVlLCBzaXRlSW5mbzogeyB0aXRsZSB9IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdDb25maWcgQVBJIEVycm9yOicsIGVycm9yKTtcclxuICAgIC8vIDQuIOWksei0pei/lOWbniAo54q25oCB56CBIDUwMClcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJDbGllbnQiLCJoYW5kbGVyIiwicmVxIiwicmVzIiwibm90aW9uIiwiYXV0aCIsInByb2Nlc3MiLCJlbnYiLCJOT1RJT05fVE9LRU4iLCJOT1RJT05fS0VZIiwiZGF0YWJhc2VJZCIsIk5PVElPTl9QQUdFX0lEIiwiTk9USU9OX0RBVEFCQVNFX0lEIiwicmVzcG9uc2UiLCJkYXRhYmFzZXMiLCJyZXRyaWV2ZSIsImRhdGFiYXNlX2lkIiwidGl0bGUiLCJwbGFpbl90ZXh0Iiwic3RhdHVzIiwianNvbiIsInN1Y2Nlc3MiLCJzaXRlSW5mbyIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/admin/config.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./src/pages/api/admin/config.js"));
module.exports = __webpack_exports__;

})();