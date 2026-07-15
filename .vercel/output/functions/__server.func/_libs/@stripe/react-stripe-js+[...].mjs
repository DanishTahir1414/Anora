import { o as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { u as require_react } from "../@floating-ui/react-dom+[...].mjs";
//#region node_modules/prop-types/lib/ReactPropTypesSecret.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_ReactPropTypesSecret = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
}));
//#endregion
//#region node_modules/prop-types/factoryWithThrowingShims.js
/**
* Copyright (c) 2013-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_factoryWithThrowingShims = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var ReactPropTypesSecret = require_ReactPropTypesSecret();
	function emptyFunction() {}
	function emptyFunctionWithReset() {}
	emptyFunctionWithReset.resetWarningCache = emptyFunction;
	module.exports = function() {
		function shim(props, propName, componentName, location, propFullName, secret) {
			if (secret === ReactPropTypesSecret) return;
			var err = /* @__PURE__ */ new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
			err.name = "Invariant Violation";
			throw err;
		}
		shim.isRequired = shim;
		function getShim() {
			return shim;
		}
		var ReactPropTypes = {
			array: shim,
			bigint: shim,
			bool: shim,
			func: shim,
			number: shim,
			object: shim,
			string: shim,
			symbol: shim,
			any: shim,
			arrayOf: getShim,
			element: shim,
			elementType: shim,
			instanceOf: getShim,
			node: shim,
			objectOf: getShim,
			oneOf: getShim,
			oneOfType: getShim,
			shape: getShim,
			exact: getShim,
			checkPropTypes: emptyFunctionWithReset,
			resetWarningCache: emptyFunction
		};
		ReactPropTypes.PropTypes = ReactPropTypes;
		return ReactPropTypes;
	};
}));
//#endregion
//#region node_modules/prop-types/index.js
var require_prop_types = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_factoryWithThrowingShims()();
}));
//#endregion
//#region node_modules/@stripe/react-stripe-js/dist/react-stripe.esm.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_prop_types = /* @__PURE__ */ __toESM(require_prop_types(), 1);
function _arrayLikeToArray(r, a) {
	(null == a || a > r.length) && (a = r.length);
	for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	return n;
}
function _arrayWithHoles(r) {
	if (Array.isArray(r)) return r;
}
function _defineProperty(e, r, t) {
	return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: true,
		configurable: true,
		writable: true
	}) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
	var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	if (null != t) {
		var e, n, i, u, a = [], f = true, o = false;
		try {
			if (i = (t = t.call(r)).next, 0 === l);
			else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
		} catch (r) {
			o = true, n = r;
		} finally {
			try {
				if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
			} finally {
				if (o) throw n;
			}
		}
		return a;
	}
}
function _nonIterableRest() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), true).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function _objectWithoutProperties(e, t) {
	if (null == e) return {};
	var o, r, i = _objectWithoutPropertiesLoose(e, t);
	if (Object.getOwnPropertySymbols) {
		var n = Object.getOwnPropertySymbols(e);
		for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
	}
	return i;
}
function _objectWithoutPropertiesLoose(r, e) {
	if (null == r) return {};
	var t = {};
	for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
		if (-1 !== e.indexOf(n)) continue;
		t[n] = r[n];
	}
	return t;
}
function _slicedToArray(r, e) {
	return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
	if ("object" != typeof t || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != typeof i) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
	var i = _toPrimitive(t, "string");
	return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
	if (r) {
		if ("string" == typeof r) return _arrayLikeToArray(r, a);
		var t = {}.toString.call(r).slice(8, -1);
		return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
	}
}
var useAttachEvent = function useAttachEvent(element, event, cb) {
	var cbDefined = !!cb;
	var cbRef = import_react.useRef(cb);
	import_react.useEffect(function() {
		cbRef.current = cb;
	}, [cb]);
	import_react.useEffect(function() {
		if (!cbDefined || !element) return function() {};
		var decoratedCb = function decoratedCb() {
			if (cbRef.current) return cbRef.current.apply(cbRef, arguments);
		};
		element.on(event, decoratedCb);
		return function() {
			element.off(event, decoratedCb);
		};
	}, [
		cbDefined,
		event,
		element,
		cbRef
	]);
};
var usePrevious = function usePrevious(value) {
	var ref = import_react.useRef(value);
	import_react.useEffect(function() {
		ref.current = value;
	}, [value]);
	return ref.current;
};
var isUnknownObject = function isUnknownObject(raw) {
	return raw !== null && _typeof(raw) === "object";
};
var isPromise = function isPromise(raw) {
	return isUnknownObject(raw) && typeof raw.then === "function";
};
var isStripe = function isStripe(raw) {
	return isUnknownObject(raw) && typeof raw.elements === "function" && typeof raw.createToken === "function" && typeof raw.createPaymentMethod === "function" && typeof raw.confirmCardPayment === "function";
};
var PLAIN_OBJECT_STR = "[object Object]";
var isEqual = function isEqual(left, right) {
	if (!isUnknownObject(left) || !isUnknownObject(right)) return left === right;
	var leftArray = Array.isArray(left);
	if (leftArray !== Array.isArray(right)) return false;
	var leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
	if (leftPlainObject !== (Object.prototype.toString.call(right) === PLAIN_OBJECT_STR)) return false;
	if (!leftPlainObject && !leftArray) return left === right;
	var leftKeys = Object.keys(left);
	var rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	var keySet = {};
	for (var i = 0; i < leftKeys.length; i += 1) keySet[leftKeys[i]] = true;
	for (var _i = 0; _i < rightKeys.length; _i += 1) keySet[rightKeys[_i]] = true;
	var allKeys = Object.keys(keySet);
	if (allKeys.length !== leftKeys.length) return false;
	var l = left;
	var r = right;
	return allKeys.every(function pred(key) {
		return isEqual(l[key], r[key]);
	});
};
var extractAllowedOptionsUpdates = function extractAllowedOptionsUpdates(options, prevOptions, immutableKeys) {
	if (!isUnknownObject(options)) return null;
	return Object.keys(options).reduce(function(newOptions, key) {
		var isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);
		if (immutableKeys.includes(key)) {
			if (isUpdated) console.warn("Unsupported prop change: options.".concat(key, " is not a mutable property."));
			return newOptions;
		}
		if (!isUpdated) return newOptions;
		return _objectSpread2(_objectSpread2({}, newOptions || {}), {}, _defineProperty({}, key, options[key]));
	}, null);
};
var INVALID_STRIPE_ERROR$1 = "Invalid prop `stripe` supplied to `Elements`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.";
var validateStripe = function validateStripe(maybeStripe) {
	var errorMsg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : INVALID_STRIPE_ERROR$1;
	if (maybeStripe === null || isStripe(maybeStripe)) return maybeStripe;
	throw new Error(errorMsg);
};
var parseStripeProp = function parseStripeProp(raw) {
	var errorMsg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : INVALID_STRIPE_ERROR$1;
	if (isPromise(raw)) return {
		tag: "async",
		stripePromise: Promise.resolve(raw).then(function(result) {
			return validateStripe(result, errorMsg);
		})
	};
	var stripe = validateStripe(raw, errorMsg);
	if (stripe === null) return { tag: "empty" };
	return {
		tag: "sync",
		stripe
	};
};
var registerWithStripeJs = function registerWithStripeJs(stripe) {
	if (!stripe || !stripe._registerWrapper || !stripe.registerAppInfo) return;
	stripe._registerWrapper({
		name: "react-stripe-js",
		version: "6.7.0"
	});
	stripe.registerAppInfo({
		name: "react-stripe-js",
		version: "6.7.0",
		url: "https://stripe.com/docs/stripe-js/react"
	});
};
var ElementsContext = /*#__PURE__*/ import_react.createContext(null);
ElementsContext.displayName = "ElementsContext";
var parseElementsContext = function parseElementsContext(ctx, useCase) {
	if (!ctx) throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(useCase, " in an <Elements> provider."));
	return ctx;
};
/**
* The `Elements` provider allows you to use [Element components](https://stripe.com/docs/stripe-js/react#element-components) and access the [Stripe object](https://stripe.com/docs/js/initializing) in any nested component.
* Render an `Elements` provider at the root of your React app so that it is available everywhere you need it.
*
* To use the `Elements` provider, call `loadStripe` from `@stripe/stripe-js` with your publishable key.
* The `loadStripe` function will asynchronously load the Stripe.js script and initialize a `Stripe` object.
* Pass the returned `Promise` to `Elements`.
*
* @docs https://docs.stripe.com/sdks/stripejs-react?ui=elements#elements-provider
*/
var Elements = function Elements(_ref) {
	var rawStripeProp = _ref.stripe, options = _ref.options, children = _ref.children;
	var parsed = import_react.useMemo(function() {
		return parseStripeProp(rawStripeProp);
	}, [rawStripeProp]);
	var _React$useState2 = _slicedToArray(import_react.useState(function() {
		return {
			stripe: parsed.tag === "sync" ? parsed.stripe : null,
			elements: parsed.tag === "sync" ? parsed.stripe.elements(options) : null
		};
	}), 2), ctx = _React$useState2[0], setContext = _React$useState2[1];
	import_react.useEffect(function() {
		var isMounted = true;
		var safeSetContext = function safeSetContext(stripe) {
			setContext(function(ctx) {
				if (ctx.stripe) return ctx;
				return {
					stripe,
					elements: stripe.elements(options)
				};
			});
		};
		if (parsed.tag === "async" && !ctx.stripe) parsed.stripePromise.then(function(stripe) {
			if (stripe && isMounted) safeSetContext(stripe);
		});
		else if (parsed.tag === "sync" && !ctx.stripe) safeSetContext(parsed.stripe);
		return function() {
			isMounted = false;
		};
	}, [
		parsed,
		ctx,
		options
	]);
	var prevStripe = usePrevious(rawStripeProp);
	import_react.useEffect(function() {
		if (prevStripe !== null && prevStripe !== rawStripeProp) console.warn("Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.");
	}, [prevStripe, rawStripeProp]);
	var prevOptions = usePrevious(options);
	import_react.useEffect(function() {
		if (!ctx.elements) return;
		var updates = extractAllowedOptionsUpdates(options, prevOptions, ["clientSecret", "fonts"]);
		if (updates) ctx.elements.update(updates);
	}, [
		options,
		prevOptions,
		ctx.elements
	]);
	import_react.useEffect(function() {
		registerWithStripeJs(ctx.stripe);
	}, [ctx.stripe]);
	return /*#__PURE__*/ import_react.createElement(ElementsContext.Provider, { value: ctx }, children);
};
Elements.propTypes = {
	stripe: import_prop_types.default.any,
	options: import_prop_types.default.object
};
var useElementsContextWithUseCase = function useElementsContextWithUseCase(useCaseMessage) {
	return parseElementsContext(import_react.useContext(ElementsContext), useCaseMessage);
};
/**
* @docs https://stripe.com/docs/stripe-js/react#useelements-hook
*/
var useElements = function useElements() {
	return useElementsContextWithUseCase("calls useElements()").elements;
};
/**
* @docs https://stripe.com/docs/stripe-js/react#elements-consumer
*/
var ElementsConsumer = function ElementsConsumer(_ref2) {
	var children = _ref2.children;
	return children(useElementsContextWithUseCase("mounts <ElementsConsumer>"));
};
ElementsConsumer.propTypes = { children: import_prop_types.default.func.isRequired };
var CheckoutContext = /*#__PURE__*/ import_react.createContext(null);
CheckoutContext.displayName = "CheckoutContext";
var useElementsOrCheckoutContextWithUseCase = function useElementsOrCheckoutContextWithUseCase(useCaseString) {
	var checkout = import_react.useContext(CheckoutContext);
	var elements = import_react.useContext(ElementsContext);
	if (checkout) if (elements) throw new Error("You cannot wrap the part of your app that ".concat(useCaseString, " in both a checkout provider and <Elements> provider."));
	else return checkout;
	else return parseElementsContext(elements, useCaseString);
};
var _excluded = ["mode"];
var capitalized = function capitalized(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};
var createElementComponent = function createElementComponent(type, isServer, customDisplayName) {
	var displayName = "".concat(capitalized(type), "Element");
	var Element = isServer ? function ServerElement(props) {
		useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
		var id = props.id, className = props.className;
		return /*#__PURE__*/ import_react.createElement("div", {
			id,
			className
		});
	} : function ClientElement(_ref) {
		var id = _ref.id, className = _ref.className, _ref$options = _ref.options, options = _ref$options === void 0 ? {} : _ref$options, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onReady = _ref.onReady, onChange = _ref.onChange, onEscape = _ref.onEscape, onClick = _ref.onClick, onLoadError = _ref.onLoadError, onLoaderStart = _ref.onLoaderStart, onNetworksChange = _ref.onNetworksChange, onConfirm = _ref.onConfirm, onCancel = _ref.onCancel, onShippingAddressChange = _ref.onShippingAddressChange, onShippingRateChange = _ref.onShippingRateChange, onSavedPaymentMethodRemove = _ref.onSavedPaymentMethodRemove, onSavedPaymentMethodUpdate = _ref.onSavedPaymentMethodUpdate, onAvailablePaymentMethodsChange = _ref.onAvailablePaymentMethodsChange;
		var ctx = useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
		var elements = "elements" in ctx ? ctx.elements : null;
		var checkoutState = "checkoutState" in ctx ? ctx.checkoutState : null;
		var checkoutSdk = (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === "success" || (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === "loading" ? checkoutState.sdk : null;
		var _React$useState2 = _slicedToArray(import_react.useState(null), 2), element = _React$useState2[0], setElement = _React$useState2[1];
		var elementRef = import_react.useRef(null);
		var domNode = import_react.useRef(null);
		useAttachEvent(element, "blur", onBlur);
		useAttachEvent(element, "focus", onFocus);
		useAttachEvent(element, "escape", onEscape);
		useAttachEvent(element, "click", onClick);
		useAttachEvent(element, "loaderror", onLoadError);
		useAttachEvent(element, "loaderstart", onLoaderStart);
		useAttachEvent(element, "networkschange", onNetworksChange);
		useAttachEvent(element, "confirm", onConfirm);
		useAttachEvent(element, "cancel", onCancel);
		useAttachEvent(element, "shippingaddresschange", onShippingAddressChange);
		useAttachEvent(element, "shippingratechange", onShippingRateChange);
		useAttachEvent(element, "savedpaymentmethodremove", onSavedPaymentMethodRemove);
		useAttachEvent(element, "savedpaymentmethodupdate", onSavedPaymentMethodUpdate);
		useAttachEvent(element, "availablepaymentmethodschange", onAvailablePaymentMethodsChange);
		useAttachEvent(element, "change", onChange);
		var readyCallback;
		if (onReady) if (type === "expressCheckout") readyCallback = onReady;
		else readyCallback = function readyCallback() {
			onReady(element);
		};
		useAttachEvent(element, "ready", readyCallback);
		import_react.useLayoutEffect(function() {
			if (elementRef.current === null && domNode.current !== null && (elements || checkoutSdk)) {
				var newElement = null;
				if (checkoutSdk) {
					var elementsSdk = checkoutSdk;
					var formSdk = checkoutSdk;
					switch (type) {
						case "paymentForm":
							newElement = formSdk.createForm(options);
							break;
						case "payment":
							newElement = elementsSdk.createPaymentElement(options);
							break;
						case "address":
							if ("mode" in options) {
								var mode = options.mode, restOptions = _objectWithoutProperties(options, _excluded);
								if (mode === "shipping") newElement = elementsSdk.createShippingAddressElement(restOptions);
								else if (mode === "billing") newElement = elementsSdk.createBillingAddressElement(restOptions);
								else throw new Error("Invalid options.mode. mode must be 'billing' or 'shipping'.");
							} else throw new Error("You must supply options.mode. mode must be 'billing' or 'shipping'.");
							break;
						case "expressCheckout":
							newElement = elementsSdk.createExpressCheckoutElement(options);
							break;
						case "currencySelector":
							newElement = checkoutSdk.createCurrencySelectorElement();
							break;
						case "taxId":
							newElement = elementsSdk.createTaxIdElement(options);
							break;
						case "contactDetails":
							newElement = elementsSdk.createContactDetailsElement();
							break;
						default: throw new Error("<".concat(displayName, "> is not supported inside a checkout provider. Use an <Elements> provider instead."));
					}
				} else if (elements) newElement = elements.create(type, options);
				elementRef.current = newElement;
				setElement(newElement);
				if (newElement) newElement.mount(domNode.current);
			}
		}, [
			elements,
			checkoutSdk,
			options
		]);
		var prevOptions = usePrevious(options);
		import_react.useEffect(function() {
			if (!elementRef.current) return;
			var updates = extractAllowedOptionsUpdates(options, prevOptions, ["paymentRequest"]);
			if (updates && "update" in elementRef.current) elementRef.current.update(updates);
		}, [options, prevOptions]);
		import_react.useLayoutEffect(function() {
			return function() {
				if (elementRef.current && typeof elementRef.current.destroy === "function") try {
					elementRef.current.destroy();
					elementRef.current = null;
				} catch (error) {}
			};
		}, []);
		return /*#__PURE__*/ import_react.createElement("div", {
			id,
			className,
			ref: domNode
		});
	};
	Element.propTypes = {
		id: import_prop_types.default.string,
		className: import_prop_types.default.string,
		onChange: import_prop_types.default.func,
		onBlur: import_prop_types.default.func,
		onFocus: import_prop_types.default.func,
		onReady: import_prop_types.default.func,
		onEscape: import_prop_types.default.func,
		onClick: import_prop_types.default.func,
		onLoadError: import_prop_types.default.func,
		onLoaderStart: import_prop_types.default.func,
		onNetworksChange: import_prop_types.default.func,
		onConfirm: import_prop_types.default.func,
		onCancel: import_prop_types.default.func,
		onShippingAddressChange: import_prop_types.default.func,
		onShippingRateChange: import_prop_types.default.func,
		onSavedPaymentMethodRemove: import_prop_types.default.func,
		onSavedPaymentMethodUpdate: import_prop_types.default.func,
		onAvailablePaymentMethodsChange: import_prop_types.default.func,
		options: import_prop_types.default.object
	};
	Element.displayName = displayName;
	Element.__elementType = type;
	return Element;
};
var isServer = typeof window === "undefined";
var EmbeddedCheckoutContext = /*#__PURE__*/ import_react.createContext(null);
EmbeddedCheckoutContext.displayName = "EmbeddedCheckoutProviderContext";
/**
* @docs https://stripe.com/docs/stripe-js/react#usestripe-hook
*/
var useStripe = function useStripe() {
	return useElementsOrCheckoutContextWithUseCase("calls useStripe()").stripe;
};
createElementComponent("auBankAccount", isServer);
createElementComponent("card", isServer);
createElementComponent("cardNumber", isServer);
createElementComponent("cardExpiry", isServer);
createElementComponent("cardCvc", isServer);
createElementComponent("currencySelector", isServer);
createElementComponent("iban", isServer);
var PaymentElement = createElementComponent("payment", isServer);
createElementComponent("expressCheckout", isServer);
createElementComponent("paymentRequestButton", isServer);
createElementComponent("linkAuthentication", isServer);
createElementComponent("contactDetails", isServer);
createElementComponent("address", isServer);
createElementComponent("shippingAddress", isServer);
createElementComponent("paymentMethodMessaging", isServer);
createElementComponent("taxId", isServer);
createElementComponent("issuingCardNumberDisplay", isServer);
createElementComponent("issuingCardCvcDisplay", isServer);
createElementComponent("issuingCardExpiryDisplay", isServer);
createElementComponent("issuingCardPinDisplay", isServer);
createElementComponent("issuingCardCopyButton", isServer);
//#endregion
export { require_prop_types as a, useStripe as i, PaymentElement as n, useElements as r, Elements as t };
