import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "./@floating-ui/react-dom+[...].mjs";
//#region node_modules/@paypal/react-paypal-js/dist/esm/react-paypal-js.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/*!
* react-paypal-js v10.1.1 (2026-06-29T15:34:02.945Z)
* Copyright 2020-present, PayPal, Inc. All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Enum for the SDK script resolve status,
*
* @enum {string}
*/
var SCRIPT_LOADING_STATE;
(function(SCRIPT_LOADING_STATE) {
	SCRIPT_LOADING_STATE["INITIAL"] = "initial";
	SCRIPT_LOADING_STATE["PENDING"] = "pending";
	SCRIPT_LOADING_STATE["REJECTED"] = "rejected";
	SCRIPT_LOADING_STATE["RESOLVED"] = "resolved";
})(SCRIPT_LOADING_STATE || (SCRIPT_LOADING_STATE = {}));
/**
* Enum for the PayPalScriptProvider context dispatch actions
*
* @enum {string}
*/
var DISPATCH_ACTION;
(function(DISPATCH_ACTION) {
	DISPATCH_ACTION["LOADING_STATUS"] = "setLoadingStatus";
	DISPATCH_ACTION["RESET_OPTIONS"] = "resetOptions";
	DISPATCH_ACTION["SET_BRAINTREE_INSTANCE"] = "braintreeInstance";
})(DISPATCH_ACTION || (DISPATCH_ACTION = {}));
/**
* Enum for all the available hosted fields
*
* @enum {string}
*/
var PAYPAL_HOSTED_FIELDS_TYPES;
(function(PAYPAL_HOSTED_FIELDS_TYPES) {
	PAYPAL_HOSTED_FIELDS_TYPES["NUMBER"] = "number";
	PAYPAL_HOSTED_FIELDS_TYPES["CVV"] = "cvv";
	PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_DATE"] = "expirationDate";
	PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_MONTH"] = "expirationMonth";
	PAYPAL_HOSTED_FIELDS_TYPES["EXPIRATION_YEAR"] = "expirationYear";
	PAYPAL_HOSTED_FIELDS_TYPES["POSTAL_CODE"] = "postalCode";
})(PAYPAL_HOSTED_FIELDS_TYPES || (PAYPAL_HOSTED_FIELDS_TYPES = {}));
var extendStatics = function(d, b) {
	extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
		d.__proto__ = b;
	} || function(d, b) {
		for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	};
	return extendStatics(d, b);
};
function __extends(d, b) {
	if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	extendStatics(d, b);
	function __() {
		this.constructor = d;
	}
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
	__assign = Object.assign || function __assign(t) {
		for (var s, i = 1, n = arguments.length; i < n; i++) {
			s = arguments[i];
			for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
		}
		return t;
	};
	return __assign.apply(this, arguments);
};
function __rest$1(s, e) {
	var t = {};
	for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	if (s != null && typeof Object.getOwnPropertySymbols === "function") {
		for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	}
	return t;
}
function __spreadArray(to, from, pack) {
	if (pack || arguments.length === 2) {
		for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
			if (!ar) ar = Array.prototype.slice.call(from, 0, i);
			ar[i] = from[i];
		}
	}
	return to.concat(ar || Array.prototype.slice.call(from));
}
/*********************************************
* Common reference to the script identifier *
*********************************************/
var SCRIPT_ID = "data-react-paypal-script-id";
var SDK_SETTINGS = {
	DATA_CLIENT_TOKEN: "dataClientToken",
	DATA_JS_SDK_LIBRARY: "dataJsSdkLibrary",
	DATA_LIBRARY_VALUE: "react-paypal-js",
	DATA_NAMESPACE: "dataNamespace",
	DATA_SDK_INTEGRATION_SOURCE: "dataSdkIntegrationSource",
	DATA_USER_ID_TOKEN: "dataUserIdToken"
};
var LOAD_SCRIPT_ERROR = "Failed to load the PayPal JS SDK script.";
var braintreeVersion = "3.117.0";
"https://js.braintreegateway.com/web/".concat(braintreeVersion, "/js/client.min.js");
"https://js.braintreegateway.com/web/".concat(braintreeVersion, "/js/paypal-checkout.min.js");
/*********************
* PayPal namespaces *
*********************/
var DEFAULT_PAYPAL_NAMESPACE = "paypal";
/*******************
* Script Provider *
*******************/
var SCRIPT_PROVIDER_REDUCER_ERROR = "usePayPalScriptReducer must be used within a PayPalScriptProvider";
/**
* Get the namespace from the window in the browser
* this is useful to get the paypal object from window
* after load PayPal SDK script
*
* @param namespace the name space to return
* @returns the namespace if exists or undefined otherwise
*/
function getPayPalWindowNamespace$1(namespace) {
	if (namespace === void 0) namespace = DEFAULT_PAYPAL_NAMESPACE;
	return window[namespace];
}
/**
* Creates a string hash code based on the string argument
*
* @param str the source input string to hash
* @returns string hash code
*/
function hashStr(str) {
	var hash = "";
	for (var i = 0; i < str.length; i++) {
		var total = str[i].charCodeAt(0) * i;
		if (str[i + 1]) total += str[i + 1].charCodeAt(0) * (i - 1);
		hash += String.fromCharCode(97 + Math.abs(total) % 26);
	}
	return hash;
}
function generateErrorMessage(_a) {
	var reactComponentName = _a.reactComponentName, sdkComponentKey = _a.sdkComponentKey, _b = _a.sdkRequestedComponents, sdkRequestedComponents = _b === void 0 ? "" : _b, _c = _a.sdkDataNamespace, sdkDataNamespace = _c === void 0 ? DEFAULT_PAYPAL_NAMESPACE : _c;
	var requiredOptionCapitalized = sdkComponentKey.charAt(0).toUpperCase().concat(sdkComponentKey.substring(1));
	var errorMessage = "Unable to render <".concat(reactComponentName, " /> because window.").concat(sdkDataNamespace, ".").concat(requiredOptionCapitalized, " is undefined.");
	var requestedComponents = typeof sdkRequestedComponents === "string" ? sdkRequestedComponents : sdkRequestedComponents.join(",");
	if (!requestedComponents.includes(sdkComponentKey)) {
		var expectedComponents = [requestedComponents, sdkComponentKey].filter(Boolean).join();
		errorMessage += "\nTo fix the issue, add '".concat(sdkComponentKey, "' to the list of components passed to the parent PayPalScriptProvider:") + "\n`<PayPalScriptProvider options={{ components: '".concat(expectedComponents, "'}}>`.");
	}
	return errorMessage;
}
/**
* Generate a new random identifier for react-paypal-js
*
* @returns the {@code string} containing the random library name
*/
function getScriptID(options) {
	var _a = options, _b = SCRIPT_ID;
	_a[_b];
	var paypalScriptOptions = __rest$1(_a, [_b + ""]);
	return "react-paypal-js-".concat(hashStr(JSON.stringify(paypalScriptOptions)));
}
/**
* Destroy the PayPal SDK from the document page
*
* @param reactPayPalScriptID the script identifier
*/
function destroySDKScript(reactPayPalScriptID) {
	var scriptNode = self.document.querySelector("script[".concat(SCRIPT_ID, "=\"").concat(reactPayPalScriptID, "\"]"));
	if (scriptNode === null || scriptNode === void 0 ? void 0 : scriptNode.parentNode) scriptNode.parentNode.removeChild(scriptNode);
}
/**
* Reducer function to handle complex state changes on the context
*
* @param state  the current state on the context object
* @param action the action to be executed on the previous state
* @returns a the same state if the action wasn't found, or a new state otherwise
*/
function scriptReducer(state, action) {
	var _a, _b;
	switch (action.type) {
		case DISPATCH_ACTION.LOADING_STATUS:
			if (typeof action.value === "object") return __assign(__assign({}, state), {
				loadingStatus: action.value.state,
				loadingStatusErrorMessage: action.value.message
			});
			return __assign(__assign({}, state), { loadingStatus: action.value });
		case DISPATCH_ACTION.RESET_OPTIONS:
			destroySDKScript(state.options[SCRIPT_ID]);
			return __assign(__assign({}, state), {
				loadingStatus: SCRIPT_LOADING_STATE.PENDING,
				options: __assign(__assign((_a = {}, _a[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _a), action.value), (_b = {}, _b[SCRIPT_ID] = "".concat(getScriptID(action.value)), _b))
			});
		case DISPATCH_ACTION.SET_BRAINTREE_INSTANCE: return __assign(__assign({}, state), { braintreePayPalCheckoutInstance: action.value });
		default: return state;
	}
}
var ScriptContext = (0, import_react.createContext)(null);
/**
* Check if the context is valid and ready to dispatch actions.
*
* @param scriptContext the result of connecting to the context provider
* @returns strict context avoiding null values in the type
*/
function validateReducer(scriptContext) {
	if (typeof (scriptContext === null || scriptContext === void 0 ? void 0 : scriptContext.dispatch) === "function" && scriptContext.dispatch.length !== 0) return scriptContext;
	throw new Error(SCRIPT_PROVIDER_REDUCER_ERROR);
}
/**
* Custom hook to get access to the Script context and
* dispatch actions to modify the state on the {@link ScriptProvider} component
*
* @returns a tuple containing the state of the context and
* a dispatch function to modify the state
*/
function usePayPalScriptReducer() {
	var scriptContext = validateReducer((0, import_react.useContext)(ScriptContext));
	return [__assign(__assign({}, scriptContext), {
		isInitial: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.INITIAL,
		isPending: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.PENDING,
		isResolved: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.RESOLVED,
		isRejected: scriptContext.loadingStatus === SCRIPT_LOADING_STATE.REJECTED
	}), scriptContext.dispatch];
}
(0, import_react.createContext)({});
/**
* `useProxyProps` can be used to maintain a reference to an updated props, without that change triggering
* another re-render. This is useful if, for example, some props should be passed through a parent component to
* a child function that contains code that needs the most up-to-date-reference, without causing the parent to
* rerender.
*/
function useProxyProps(props) {
	var proxyRef = (0, import_react.useRef)(new Proxy({}, { get: function(target, prop, receiver) {
		/**
		*
		* If target[prop] is a function, return a function that accesses
		* this function off the target object. We can mutate the target with
		* new copies of this function without having to re-render the
		* SDK components to pass new callbacks.
		*
		* */
		if (typeof target[prop] === "function") return function() {
			var args = [];
			for (var _i = 0; _i < arguments.length; _i++) args[_i] = arguments[_i];
			return target[prop].apply(target, args);
		};
		return Reflect.get(target, prop, receiver);
	} }));
	proxyRef.current = Object.assign(proxyRef.current, props);
	return proxyRef.current;
}
var PayPalButtonsErrorBoundary = function(_super) {
	__extends(PayPalButtonsErrorBoundary, _super);
	function PayPalButtonsErrorBoundary(props) {
		var _this = _super.call(this, props) || this;
		_this.state = { hasError: false };
		return _this;
	}
	PayPalButtonsErrorBoundary.getDerivedStateFromError = function() {
		return { hasError: true };
	};
	PayPalButtonsErrorBoundary.prototype.componentDidCatch = function(error, errorInfo) {
		console.error("Error in PayPalButtons component:", error, errorInfo);
		if (typeof this.props.onError === "function") this.props.onError({
			message: error.message,
			name: error.name,
			stack: error.stack,
			componentStack: errorInfo.componentStack
		});
	};
	PayPalButtonsErrorBoundary.prototype.render = function() {
		if (this.state.hasError) return null;
		return this.props.children;
	};
	return PayPalButtonsErrorBoundary;
}(import_react.Component);
/**
The inner component that renders the PayPal buttons. This component is wrapped in an error boundary to catch and handle any errors that may occur during rendering or interaction with the PayPal buttons.
*/
var PayPalButtonsInner = function(_a) {
	var _b;
	var _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, children = _a.children, _e = _a.forceReRender, forceReRender = _e === void 0 ? [] : _e, buttonProps = __rest$1(_a, [
		"className",
		"disabled",
		"children",
		"forceReRender"
	]);
	var isDisabledStyle = disabled ? { opacity: .38 } : {};
	var classNames = "".concat(className, " ").concat(disabled ? "paypal-buttons-disabled" : "").trim();
	var buttonsContainerRef = (0, import_react.useRef)(null);
	var buttons = (0, import_react.useRef)(null);
	var proxyProps = useProxyProps(buttonProps);
	var _f = usePayPalScriptReducer()[0], isResolved = _f.isResolved, options = _f.options;
	var _g = (0, import_react.useState)(null), initActions = _g[0], setInitActions = _g[1];
	var _h = (0, import_react.useState)(true), isEligible = _h[0], setIsEligible = _h[1];
	var setErrorState = (0, import_react.useState)(null)[1];
	function closeButtonsComponent() {
		if (buttons.current !== null) buttons.current.close().catch(function() {});
	}
	if ((_b = buttons.current) === null || _b === void 0 ? void 0 : _b.updateProps) buttons.current.updateProps({ message: buttonProps.message });
	(0, import_react.useEffect)(function() {
		if (isResolved === false) return closeButtonsComponent;
		var paypalWindowNamespace = getPayPalWindowNamespace$1(options.dataNamespace);
		if (paypalWindowNamespace === void 0 || paypalWindowNamespace.Buttons === void 0) {
			setErrorState(function() {
				throw new Error(generateErrorMessage({
					reactComponentName: PayPalButtons.displayName,
					sdkComponentKey: "buttons",
					sdkRequestedComponents: options.components,
					sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
				}));
			});
			return closeButtonsComponent;
		}
		var decoratedOnInit = function(data, actions) {
			setInitActions(actions);
			if (typeof buttonProps.onInit === "function") buttonProps.onInit(data, actions);
		};
		try {
			buttons.current = paypalWindowNamespace.Buttons(__assign(__assign({}, proxyProps), { onInit: decoratedOnInit }));
		} catch (err) {
			return setErrorState(function() {
				throw new Error("Failed to render <PayPalButtons /> component. Failed to initialize:  ".concat(err));
			});
		}
		if (buttons.current.isEligible() === false) {
			setIsEligible(false);
			return closeButtonsComponent;
		}
		if (!buttonsContainerRef.current) return closeButtonsComponent;
		buttons.current.render(buttonsContainerRef.current).catch(function(err) {
			if (buttonsContainerRef.current === null || buttonsContainerRef.current.children.length === 0) return;
			setErrorState(function() {
				throw new Error("Failed to render <PayPalButtons /> component. ".concat(err));
			});
		});
		return closeButtonsComponent;
	}, __spreadArray(__spreadArray([isResolved], forceReRender, true), [buttonProps.fundingSource], false));
	(0, import_react.useEffect)(function() {
		if (initActions === null) return;
		if (disabled === true) initActions.disable().catch(function() {});
		else initActions.enable().catch(function() {});
	}, [disabled, initActions]);
	return import_react.createElement(import_react.Fragment, null, isEligible ? import_react.createElement("div", {
		ref: buttonsContainerRef,
		style: isDisabledStyle,
		className: classNames
	}) : children);
};
PayPalButtonsInner.displayName = "PayPalButtons";
/**
This `<PayPalButtons />` component supports rendering [buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons) for PayPal, Venmo, and alternative payment methods.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/
var PayPalButtons = function(props) {
	return import_react.createElement(PayPalButtonsErrorBoundary, { onError: props.onError }, import_react.createElement(PayPalButtonsInner, __assign({}, props)));
};
PayPalButtons.displayName = "PayPalButtons";
function __rest(s, e) {
	var t = {};
	for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	if (s != null && typeof Object.getOwnPropertySymbols === "function") {
		for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
	}
	return t;
}
function findScript(url, attributes) {
	var currentScript = document.querySelector("script[src=\"".concat(url, "\"]"));
	if (currentScript === null) return null;
	var nextScript = createScriptElement(url, attributes);
	var currentScriptClone = currentScript.cloneNode();
	delete currentScriptClone.dataset.uidAuto;
	if (Object.keys(currentScriptClone.dataset).length !== Object.keys(nextScript.dataset).length) return null;
	var isExactMatch = true;
	Object.keys(currentScriptClone.dataset).forEach(function(key) {
		if (currentScriptClone.dataset[key] !== nextScript.dataset[key]) isExactMatch = false;
	});
	return isExactMatch ? currentScript : null;
}
function insertScriptElement(_a) {
	var url = _a.url, attributes = _a.attributes, onSuccess = _a.onSuccess, onError = _a.onError;
	var newScript = createScriptElement(url, attributes);
	newScript.onerror = onError;
	newScript.onload = onSuccess;
	document.head.insertBefore(newScript, document.head.firstElementChild);
}
function processOptions(options) {
	var customSdkBaseUrl = Object.prototype.hasOwnProperty.call(options, "sdkBaseUrl") ? options.sdkBaseUrl : void 0;
	var environment = options.environment;
	options.sdkBaseUrl;
	var rest = __rest(options, ["environment", "sdkBaseUrl"]);
	var sdkBaseUrl = customSdkBaseUrl || processSdkBaseUrl(environment);
	var optionsWithStringIndex = rest;
	var _a = Object.keys(optionsWithStringIndex).filter(function(key) {
		return typeof optionsWithStringIndex[key] !== "undefined" && optionsWithStringIndex[key] !== null && optionsWithStringIndex[key] !== "";
	}).reduce(function(accumulator, key) {
		var value = optionsWithStringIndex[key].toString();
		key = camelCaseToKebabCase(key);
		if (key.substring(0, 4) === "data" || key === "crossorigin") accumulator.attributes[key] = value;
		else accumulator.queryParams[key] = value;
		return accumulator;
	}, {
		queryParams: {},
		attributes: {}
	}), queryParams = _a.queryParams, attributes = _a.attributes;
	if (queryParams["merchant-id"] && queryParams["merchant-id"].indexOf(",") !== -1) {
		attributes["data-merchant-id"] = queryParams["merchant-id"];
		queryParams["merchant-id"] = "*";
	}
	return {
		url: "".concat(sdkBaseUrl, "?").concat(objectToQueryString(queryParams)),
		attributes
	};
}
function camelCaseToKebabCase(str) {
	var replacer = function(match, indexOfMatch) {
		return (indexOfMatch ? "-" : "") + match.toLowerCase();
	};
	return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, replacer);
}
function objectToQueryString(params) {
	var queryString = "";
	Object.keys(params).forEach(function(key) {
		if (queryString.length !== 0) queryString += "&";
		queryString += key + "=" + params[key];
	});
	return queryString;
}
function processSdkBaseUrl(environment) {
	return environment === "sandbox" ? "https://www.sandbox.paypal.com/sdk/js" : "https://www.paypal.com/sdk/js";
}
function createScriptElement(url, attributes) {
	if (attributes === void 0) attributes = {};
	var newScript = document.createElement("script");
	newScript.src = url;
	Object.keys(attributes).forEach(function(key) {
		newScript.setAttribute(key, attributes[key]);
		if (key === "data-csp-nonce") newScript.setAttribute("nonce", attributes["data-csp-nonce"]);
	});
	return newScript;
}
function loadScript(options, PromisePonyfill) {
	if (PromisePonyfill === void 0) PromisePonyfill = Promise;
	validateArguments(options, PromisePonyfill);
	if (typeof document === "undefined") return PromisePonyfill.resolve(null);
	var _a = processOptions(options), url = _a.url, attributes = _a.attributes;
	var namespace = attributes["data-namespace"] || "paypal";
	var existingWindowNamespace = getPayPalWindowNamespace(namespace);
	if (!attributes["data-js-sdk-library"]) attributes["data-js-sdk-library"] = "paypal-js";
	if (findScript(url, attributes) && existingWindowNamespace) return PromisePonyfill.resolve(existingWindowNamespace);
	return loadCustomScript({
		url,
		attributes
	}, PromisePonyfill).then(function() {
		var newWindowNamespace = getPayPalWindowNamespace(namespace);
		if (newWindowNamespace) return newWindowNamespace;
		throw new Error("The window.".concat(namespace, " global variable is not available."));
	});
}
function loadCustomScript(options, PromisePonyfill) {
	if (PromisePonyfill === void 0) PromisePonyfill = Promise;
	validateArguments(options, PromisePonyfill);
	var url = options.url, attributes = options.attributes;
	if (typeof url !== "string" || url.length === 0) throw new Error("Invalid url.");
	if (typeof attributes !== "undefined" && typeof attributes !== "object") throw new Error("Expected attributes to be an object.");
	return new PromisePonyfill(function(resolve, reject) {
		if (typeof document === "undefined") return resolve();
		insertScriptElement({
			url,
			attributes,
			onSuccess: function() {
				return resolve();
			},
			onError: function() {
				return reject(new Error("The script \"".concat(url, "\" failed to load. Check the HTTP status code and response body in DevTools to learn more.")));
			}
		});
	});
}
function getPayPalWindowNamespace(namespace) {
	return window[namespace];
}
function validateArguments(options, PromisePonyfill) {
	if (typeof options !== "object" || options === null) throw new Error("Expected an options object.");
	var environment = options.environment;
	if (environment && environment !== "production" && environment !== "sandbox") throw new Error("The `environment` option must be either \"production\" or \"sandbox\".");
	if (typeof PromisePonyfill !== "undefined" && typeof PromisePonyfill !== "function") throw new Error("Expected PromisePonyfill to be a function.");
}
/**
The `<PayPalMarks />` component is used for conditionally rendering different payment options using radio buttons.
The [Display PayPal Buttons with other Payment Methods guide](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#display-paypal-buttons-with-other-payment-methods) describes this style of integration in detail.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.

This component can also be configured to use a single funding source similar to the [standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/) approach.
A `FUNDING` object is exported by this library which has a key for every available funding source option.
*/
var PayPalMarks = function(_a) {
	var _b = _a.className, className = _b === void 0 ? "" : _b, children = _a.children, markProps = __rest$1(_a, ["className", "children"]);
	var _c = usePayPalScriptReducer()[0], isResolved = _c.isResolved, options = _c.options;
	var markContainerRef = (0, import_react.useRef)(null);
	var _d = (0, import_react.useState)(true), isEligible = _d[0], setIsEligible = _d[1];
	var setErrorState = (0, import_react.useState)(null)[1];
	/**
	* Render PayPal Mark into the DOM
	*/
	var renderPayPalMark = function(mark) {
		var current = markContainerRef.current;
		if (!current || !mark.isEligible()) return setIsEligible(false);
		if (current.firstChild) current.removeChild(current.firstChild);
		mark.render(current).catch(function(err) {
			if (current === null || current.children.length === 0) return;
			setErrorState(function() {
				throw new Error("Failed to render <PayPalMarks /> component. ".concat(err));
			});
		});
	};
	(0, import_react.useEffect)(function() {
		if (isResolved === false) return;
		var paypalWindowNamespace = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE]);
		if (paypalWindowNamespace === void 0 || paypalWindowNamespace.Marks === void 0) return setErrorState(function() {
			throw new Error(generateErrorMessage({
				reactComponentName: PayPalMarks.displayName,
				sdkComponentKey: "marks",
				sdkRequestedComponents: options.components,
				sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
			}));
		});
		renderPayPalMark(paypalWindowNamespace.Marks(__assign({}, markProps)));
	}, [isResolved, markProps.fundingSource]);
	return import_react.createElement(import_react.Fragment, null, isEligible ? import_react.createElement("div", {
		ref: markContainerRef,
		className
	}) : children);
};
PayPalMarks.displayName = "PayPalMarks";
/**
This `<PayPalMessages />` messages component renders a credit messaging on upstream merchant sites.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/
var PayPalMessages = function(_a) {
	var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.forceReRender, forceReRender = _c === void 0 ? [] : _c, messageProps = __rest$1(_a, ["className", "forceReRender"]);
	var _d = usePayPalScriptReducer()[0], isResolved = _d.isResolved, options = _d.options;
	var messagesContainerRef = (0, import_react.useRef)(null);
	var messages = (0, import_react.useRef)(null);
	var setErrorState = (0, import_react.useState)(null)[1];
	(0, import_react.useEffect)(function() {
		if (isResolved === false) return;
		var paypalWindowNamespace = getPayPalWindowNamespace$1(options[SDK_SETTINGS.DATA_NAMESPACE]);
		if (paypalWindowNamespace === void 0 || paypalWindowNamespace.Messages === void 0) return setErrorState(function() {
			throw new Error(generateErrorMessage({
				reactComponentName: PayPalMessages.displayName,
				sdkComponentKey: "messages",
				sdkRequestedComponents: options.components,
				sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE]
			}));
		});
		messages.current = paypalWindowNamespace.Messages(__assign({}, messageProps));
		messages.current.render(messagesContainerRef.current).catch(function(err) {
			if (messagesContainerRef.current === null || messagesContainerRef.current.children.length === 0) return;
			setErrorState(function() {
				throw new Error("Failed to render <PayPalMessages /> component. ".concat(err));
			});
		});
	}, __spreadArray([isResolved], forceReRender, true));
	return import_react.createElement("div", {
		ref: messagesContainerRef,
		className
	});
};
PayPalMessages.displayName = "PayPalMessages";
/**
This `<PayPalScriptProvider />` component takes care of loading the JS SDK `<script>`.
It manages state for script loading so children components like `<PayPalButtons />` know when it's safe to use the `window.paypal` global namespace.

Note: You always should use this component as a wrapper for  `PayPalButtons`, `PayPalMarks`, `PayPalMessages` and `BraintreePayPalButtons` components.
*/
var PayPalScriptProvider = function(_a) {
	var _b;
	var _c = _a.options, options = _c === void 0 ? { clientId: "test" } : _c, children = _a.children, _d = _a.deferLoading, deferLoading = _d === void 0 ? false : _d;
	var _e = (0, import_react.useReducer)(scriptReducer, {
		options: __assign(__assign({}, options), (_b = {}, _b[SDK_SETTINGS.DATA_JS_SDK_LIBRARY] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SDK_SETTINGS.DATA_SDK_INTEGRATION_SOURCE] = SDK_SETTINGS.DATA_LIBRARY_VALUE, _b[SCRIPT_ID] = "".concat(getScriptID(options)), _b)),
		loadingStatus: deferLoading ? SCRIPT_LOADING_STATE.INITIAL : SCRIPT_LOADING_STATE.PENDING
	}), state = _e[0], dispatch = _e[1];
	(0, import_react.useEffect)(function() {
		if (deferLoading === false && state.loadingStatus === SCRIPT_LOADING_STATE.INITIAL) return dispatch({
			type: DISPATCH_ACTION.LOADING_STATUS,
			value: SCRIPT_LOADING_STATE.PENDING
		});
		if (state.loadingStatus !== SCRIPT_LOADING_STATE.PENDING) return;
		var isSubscribed = true;
		loadScript(state.options).then(function() {
			if (isSubscribed) dispatch({
				type: DISPATCH_ACTION.LOADING_STATUS,
				value: SCRIPT_LOADING_STATE.RESOLVED
			});
		}).catch(function(err) {
			console.error("".concat(LOAD_SCRIPT_ERROR, " ").concat(err));
			if (isSubscribed) dispatch({
				type: DISPATCH_ACTION.LOADING_STATUS,
				value: {
					state: SCRIPT_LOADING_STATE.REJECTED,
					message: String(err)
				}
			});
		});
		return function() {
			isSubscribed = false;
		};
	}, [
		state.options,
		deferLoading,
		state.loadingStatus
	]);
	return import_react.createElement(ScriptContext.Provider, { value: __assign(__assign({}, state), { dispatch }) }, children);
};
function ignore() {}
(0, import_react.createContext)({
	cardFieldsForm: null,
	fields: {},
	registerField: ignore,
	unregisterField: ignore
});
var FUNDING$1 = {
	PAYPAL: "paypal",
	VENMO: "venmo",
	APPLEPAY: "applepay",
	ITAU: "itau",
	CREDIT: "credit",
	PAYLATER: "paylater",
	CARD: "card",
	IDEAL: "ideal",
	SEPA: "sepa",
	BANCONTACT: "bancontact",
	GIROPAY: "giropay",
	SOFORT: "sofort",
	EPS: "eps",
	MYBANK: "mybank",
	P24: "p24",
	PAYU: "payu",
	BLIK: "blik",
	TRUSTLY: "trustly",
	OXXO: "oxxo",
	BOLETO: "boleto",
	BOLETOBANCARIO: "boletobancario",
	WECHATPAY: "wechatpay",
	MERCADOPAGO: "mercadopago",
	MULTIBANCO: "multibanco",
	SATISPAY: "satispay",
	PAIDY: "paidy",
	ZIMPLER: "zimpler",
	MAXIMA: "maxima"
};
FUNDING$1.IDEAL, FUNDING$1.BANCONTACT, FUNDING$1.GIROPAY, FUNDING$1.SOFORT, FUNDING$1.EPS, FUNDING$1.MYBANK, FUNDING$1.P24, FUNDING$1.PAYU, FUNDING$1.BLIK, FUNDING$1.TRUSTLY, FUNDING$1.OXXO, FUNDING$1.BOLETO, FUNDING$1.BOLETOBANCARIO, FUNDING$1.WECHATPAY, FUNDING$1.MERCADOPAGO, FUNDING$1.MULTIBANCO, FUNDING$1.SATISPAY, FUNDING$1.PAIDY, FUNDING$1.MAXIMA, FUNDING$1.ZIMPLER;
//#endregion
export { PayPalScriptProvider as n, PayPalButtons as t };
