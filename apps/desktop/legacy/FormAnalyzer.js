"use strict";
/**
 * @fileoverview AI-Powered Form Intelligence System
 * @description Intelligent form field detection, analysis, and data mapping
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade form analysis with privacy protection
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormAnalyzer = exports.SemanticFieldType = exports.FormElementType = void 0;
var events_1 = require("events");
var crypto_1 = require("crypto");
var electron_store_1 = require("electron-store");
var lru_cache_1 = require("lru-cache");
var FormElementType;
(function (FormElementType) {
    FormElementType["TEXT_INPUT"] = "text-input";
    FormElementType["EMAIL_INPUT"] = "email-input";
    FormElementType["PHONE_INPUT"] = "phone-input";
    FormElementType["PASSWORD_INPUT"] = "password-input";
    FormElementType["TEXTAREA"] = "textarea";
    FormElementType["SELECT"] = "select";
    FormElementType["CHECKBOX"] = "checkbox";
    FormElementType["RADIO"] = "radio";
    FormElementType["FILE_UPLOAD"] = "file-upload";
    FormElementType["DATE_INPUT"] = "date-input";
    FormElementType["NUMBER_INPUT"] = "number-input";
    FormElementType["SUBMIT_BUTTON"] = "submit-button";
    FormElementType["UNKNOWN"] = "unknown";
})(FormElementType || (exports.FormElementType = FormElementType = {}));
var SemanticFieldType;
(function (SemanticFieldType) {
    SemanticFieldType["FIRST_NAME"] = "first-name";
    SemanticFieldType["LAST_NAME"] = "last-name";
    SemanticFieldType["FULL_NAME"] = "full-name";
    SemanticFieldType["EMAIL"] = "email";
    SemanticFieldType["PHONE"] = "phone";
    SemanticFieldType["ADDRESS"] = "address";
    SemanticFieldType["CITY"] = "city";
    SemanticFieldType["STATE"] = "state";
    SemanticFieldType["ZIP_CODE"] = "zip-code";
    SemanticFieldType["COUNTRY"] = "country";
    SemanticFieldType["COMPANY"] = "company";
    SemanticFieldType["JOB_TITLE"] = "job-title";
    SemanticFieldType["EXPERIENCE_YEARS"] = "experience-years";
    SemanticFieldType["SALARY"] = "salary";
    SemanticFieldType["RESUME"] = "resume";
    SemanticFieldType["COVER_LETTER"] = "cover-letter";
    SemanticFieldType["LINKEDIN_URL"] = "linkedin-url";
    SemanticFieldType["PORTFOLIO_URL"] = "portfolio-url";
    SemanticFieldType["WORK_AUTHORIZATION"] = "work-authorization";
    SemanticFieldType["START_DATE"] = "start-date";
    SemanticFieldType["SKILLS"] = "skills";
    SemanticFieldType["EDUCATION"] = "education";
    SemanticFieldType["CUSTOM_QUESTION"] = "custom-question";
    SemanticFieldType["UNKNOWN"] = "unknown";
})(SemanticFieldType || (exports.SemanticFieldType = SemanticFieldType = {}));
// =============================================================================
// FORM ANALYZER CLASS
// =============================================================================
var FormAnalyzer = /** @class */ (function (_super) {
    __extends(FormAnalyzer, _super);
    function FormAnalyzer() {
        var _this = _super.call(this) || this;
        _this.schemaCache = new lru_cache_1.LRUCache({ max: 1000 });
        _this.mappingCache = new lru_cache_1.LRUCache({ max: 500 });
        _this.analysisCache = new lru_cache_1.LRUCache({ max: 2000 });
        // Semantic analysis patterns
        _this.semanticPatterns = new Map();
        _this.contextualKeywords = new Map();
        _this.store = new electron_store_1.default({
            name: 'form-analyzer',
            defaults: {
                patterns: {},
                mappings: {},
                statistics: {
                    formsAnalyzed: 0,
                    successfulMappings: 0,
                    averageAnalysisTime: 0
                }
            }
        });
        _this.initializeSemanticPatterns();
        _this.loadCachedData();
        return _this;
    }
    // =============================================================================
    // MAIN ANALYSIS INTERFACE
    // =============================================================================
    /**
     * Analyze form and create comprehensive schema
     */
    FormAnalyzer.prototype.analyzeForm = function (page, url) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisId, startTime, pageUrl, cacheKey, cachedSchema, elements, sections, flow, validation, metadata, schema, analysisTime, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        analysisId = (0, crypto_1.randomUUID)();
                        startTime = Date.now();
                        console.log("\uD83D\uDD0D [".concat(analysisId, "] Starting form analysis"));
                        this.emit('analysis-started', { analysisId: analysisId, url: url });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        pageUrl = url || page.url();
                        cacheKey = this.generateCacheKey(pageUrl);
                        cachedSchema = this.schemaCache.get(cacheKey);
                        if (cachedSchema && this.isCacheValid(cachedSchema)) {
                            console.log("\uD83D\uDCBE [".concat(analysisId, "] Using cached schema"));
                            return [2 /*return*/, cachedSchema];
                        }
                        return [4 /*yield*/, this.discoverFormElements(page)];
                    case 2:
                        elements = _a.sent();
                        return [4 /*yield*/, this.identifyFormSections(elements, page)];
                    case 3:
                        sections = _a.sent();
                        return [4 /*yield*/, this.analyzeFormFlow(page)];
                    case 4:
                        flow = _a.sent();
                        return [4 /*yield*/, this.analyzeValidation(page)];
                    case 5:
                        validation = _a.sent();
                        return [4 /*yield*/, this.extractMetadata(page, elements)];
                    case 6:
                        metadata = _a.sent();
                        // Apply semantic analysis
                        return [4 /*yield*/, this.applySemanticAnalysis(elements)];
                    case 7:
                        // Apply semantic analysis
                        _a.sent();
                        schema = {
                            id: analysisId,
                            url: pageUrl,
                            timestamp: new Date(),
                            elements: elements,
                            sections: sections,
                            flow: flow,
                            validation: validation,
                            metadata: metadata
                        };
                        // Cache the schema
                        this.schemaCache.set(cacheKey, schema);
                        analysisTime = Date.now() - startTime;
                        console.log("\u2705 [".concat(analysisId, "] Form analysis completed in ").concat(analysisTime, "ms"));
                        this.emit('analysis-completed', {
                            analysisId: analysisId,
                            schema: schema,
                            analysisTime: analysisTime,
                            elementsFound: elements.length
                        });
                        return [2 /*return*/, schema];
                    case 8:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        console.error("\u274C [".concat(analysisId, "] Form analysis failed: ").concat(errorMessage));
                        this.emit('analysis-failed', { analysisId: analysisId, error: errorMessage });
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create data mapping plan for form filling
     */
    FormAnalyzer.prototype.createDataMappingPlan = function (schema, userProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, mappings, fillOrder, validationChecks, _i, _a, element, mapping, checks, optimizedOrder, plan, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        planId = (0, crypto_1.randomUUID)();
                        console.log("\uD83D\uDCCB [".concat(planId, "] Creating data mapping plan"));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        mappings = [];
                        fillOrder = [];
                        validationChecks = [];
                        _i = 0, _a = schema.elements;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        element = _a[_i];
                        return [4 /*yield*/, this.createElementMapping(element, userProfile)];
                    case 3:
                        mapping = _b.sent();
                        if (mapping) {
                            mappings.push(mapping);
                        }
                        // Add to fill order if mappable
                        if (mapping && mapping.confidence > 0.6) {
                            fillOrder.push(element.id);
                        }
                        checks = this.createValidationChecks(element);
                        validationChecks.push.apply(validationChecks, checks);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        optimizedOrder = this.optimizeFillOrder(fillOrder, schema);
                        plan = {
                            formId: schema.id,
                            mappings: mappings,
                            fillOrder: optimizedOrder,
                            validationChecks: validationChecks,
                            estimatedTime: this.estimateFillTime(mappings, schema)
                        };
                        console.log("\u2705 [".concat(planId, "] Created plan with ").concat(mappings.length, " mappings"));
                        return [2 /*return*/, plan];
                    case 6:
                        error_2 = _b.sent();
                        console.error("\u274C [".concat(planId, "] Failed to create mapping plan: ").concat(error_2));
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute form filling plan
     */
    FormAnalyzer.prototype.executeFormFillPlan = function (page, plan, schema) {
        return __awaiter(this, void 0, void 0, function () {
            var executionId, startTime, results, successCount, _loop_1, this_1, _i, _a, elementId, validationResults, executionTime, successRate, result, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        executionId = (0, crypto_1.randomUUID)();
                        startTime = Date.now();
                        console.log("\uD83D\uDE80 [".concat(executionId, "] Executing form fill plan"));
                        results = [];
                        successCount = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        _loop_1 = function (elementId) {
                            var mapping, element, fieldResult, fieldError_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        mapping = plan.mappings.find(function (m) { return m.elementId === elementId; });
                                        element = schema.elements.find(function (e) { return e.id === elementId; });
                                        if (!mapping || !element)
                                            return [2 /*return*/, "continue"];
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 4, , 5]);
                                        return [4 /*yield*/, this_1.fillFormElement(page, element, mapping)];
                                    case 2:
                                        fieldResult = _c.sent();
                                        results.push(fieldResult);
                                        if (fieldResult.success) {
                                            successCount++;
                                        }
                                        // Add natural delay between fills
                                        return [4 /*yield*/, this_1.naturalDelay()];
                                    case 3:
                                        // Add natural delay between fills
                                        _c.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        fieldError_1 = _c.sent();
                                        console.error("\u274C Failed to fill field ".concat(elementId, ": ").concat(fieldError_1));
                                        results.push({
                                            elementId: elementId,
                                            success: false,
                                            error: fieldError_1 instanceof Error ? fieldError_1.message : String(fieldError_1)
                                        });
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = plan.fillOrder;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        elementId = _a[_i];
                        return [5 /*yield**/, _loop_1(elementId)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.runValidationChecks(page, plan.validationChecks)];
                    case 6:
                        validationResults = _b.sent();
                        executionTime = Date.now() - startTime;
                        successRate = (successCount / plan.mappings.length) * 100;
                        result = {
                            success: successRate > 70, // Consider successful if >70% fields filled
                            executionTime: executionTime,
                            fieldsAttempted: plan.mappings.length,
                            fieldsSuccessful: successCount,
                            successRate: successRate,
                            fieldResults: results,
                            validationResults: validationResults,
                            errors: results.filter(function (r) { return !r.success; }).map(function (r) { return r.error; }).filter(Boolean)
                        };
                        console.log("\u2705 [".concat(executionId, "] Form fill completed: ").concat(successRate.toFixed(1), "% success"));
                        return [2 /*return*/, result];
                    case 7:
                        error_3 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                executionTime: Date.now() - startTime,
                                fieldsAttempted: plan.mappings.length,
                                fieldsSuccessful: successCount,
                                successRate: 0,
                                fieldResults: results,
                                validationResults: [],
                                errors: [error_3 instanceof Error ? error_3.message : String(error_3)]
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // FORM ELEMENT DISCOVERY
    // =============================================================================
    FormAnalyzer.prototype.discoverFormElements = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var elementSelectors, elements, _i, elementSelectors_1, selector, pageElements, i, element, formElement, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔍 Discovering form elements...');
                        elementSelectors = [
                            'input',
                            'textarea',
                            'select',
                            'button[type="submit"]',
                            'button:contains("submit")',
                            'button:contains("apply")',
                            'button:contains("next")',
                            'button:contains("continue")'
                        ];
                        elements = [];
                        _i = 0, elementSelectors_1 = elementSelectors;
                        _a.label = 1;
                    case 1:
                        if (!(_i < elementSelectors_1.length)) return [3 /*break*/, 10];
                        selector = elementSelectors_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, page.locator(selector).all()];
                    case 3:
                        pageElements = _a.sent();
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < pageElements.length)) return [3 /*break*/, 7];
                        element = pageElements[i];
                        return [4 /*yield*/, this.analyzeFormElement(element, i)];
                    case 5:
                        formElement = _a.sent();
                        if (formElement) {
                            elements.push(formElement);
                        }
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_4 = _a.sent();
                        console.warn("\u26A0\uFE0F Error discovering ".concat(selector, " elements: ").concat(error_4));
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10:
                        console.log("\u2705 Discovered ".concat(elements.length, " form elements"));
                        return [2 /*return*/, elements];
                }
            });
        });
    };
    FormAnalyzer.prototype.analyzeFormElement = function (element, index) {
        return __awaiter(this, void 0, void 0, function () {
            var tagName, attributes, labels, position, visibility, formElement, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, element.evaluate(function (el) { return el.tagName.toLowerCase(); })];
                    case 1:
                        tagName = _b.sent();
                        return [4 /*yield*/, this.getElementAttributes(element)];
                    case 2:
                        attributes = _b.sent();
                        return [4 /*yield*/, this.getElementLabels(element)];
                    case 3:
                        labels = _b.sent();
                        return [4 /*yield*/, this.getElementPosition(element)];
                    case 4:
                        position = _b.sent();
                        return [4 /*yield*/, this.getVisibilityInfo(element)];
                    case 5:
                        visibility = _b.sent();
                        _a = {
                            id: "element_".concat(index, "_").concat((0, crypto_1.randomUUID)().slice(0, 8)),
                            type: this.determineElementType(tagName, attributes),
                            tag: tagName
                        };
                        return [4 /*yield*/, this.generateUniqueSelector(element)];
                    case 6:
                        formElement = (_a.selector = _b.sent(),
                            _a.attributes = attributes,
                            _a.labels = labels,
                            _a.placeholder = attributes.placeholder || '',
                            _a.value = attributes.value || '',
                            _a.required = attributes.required === 'true' || 'required' in attributes,
                            _a.validation = this.extractValidationRules(attributes),
                            _a.position = position,
                            _a.visibility = visibility,
                            _a.semanticMeaning = {
                                fieldType: SemanticFieldType.UNKNOWN,
                                confidence: 0,
                                reasoning: [],
                                alternatives: []
                            },
                            _a);
                        return [2 /*return*/, formElement];
                    case 7:
                        error_5 = _b.sent();
                        console.warn("\u26A0\uFE0F Error analyzing form element: ".concat(error_5));
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // =============================================================================
    // SEMANTIC ANALYSIS
    // =============================================================================
    FormAnalyzer.prototype.applySemanticAnalysis = function (elements) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, elements_1, element, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🧠 Applying semantic analysis...');
                        _i = 0, elements_1 = elements;
                        _b.label = 1;
                    case 1:
                        if (!(_i < elements_1.length)) return [3 /*break*/, 4];
                        element = elements_1[_i];
                        _a = element;
                        return [4 /*yield*/, this.analyzeSemanticMeaning(element)];
                    case 2:
                        _a.semanticMeaning = _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    FormAnalyzer.prototype.analyzeSemanticMeaning = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var analysisKey, cached, reasoning, scores, sortedScores, topMatch, alternatives, meaning;
            return __generator(this, function (_a) {
                analysisKey = "".concat(element.selector, "_").concat(element.attributes.name, "_").concat(element.labels.join('_'));
                cached = this.analysisCache.get(analysisKey);
                if (cached) {
                    return [2 /*return*/, cached];
                }
                reasoning = [];
                scores = new Map();
                // Analyze by attribute patterns
                this.analyzeByAttributes(element, scores, reasoning);
                // Analyze by label text
                this.analyzeByLabels(element, scores, reasoning);
                // Analyze by context (nearby elements)
                this.analyzeByContext(element, scores, reasoning);
                // Analyze by element properties
                this.analyzeByElementProperties(element, scores, reasoning);
                sortedScores = Array.from(scores.entries()).sort(function (a, b) { return b[1] - a[1]; });
                topMatch = sortedScores[0];
                alternatives = sortedScores.slice(1, 4).map(function (_a) {
                    var type = _a[0];
                    return type;
                });
                meaning = {
                    fieldType: topMatch ? topMatch[0] : SemanticFieldType.UNKNOWN,
                    confidence: topMatch ? topMatch[1] : 0,
                    reasoning: reasoning,
                    alternatives: alternatives
                };
                // Cache the result
                this.analysisCache.set(analysisKey, meaning);
                return [2 /*return*/, meaning];
            });
        });
    };
    FormAnalyzer.prototype.analyzeByAttributes = function (element, scores, reasoning) {
        var _a = element.attributes, name = _a.name, id = _a.id, type = _a.type, autocomplete = _a.autocomplete;
        var searchText = "".concat(name, " ").concat(id, " ").concat(autocomplete).toLowerCase();
        // Check patterns for each semantic type
        for (var _i = 0, _b = this.semanticPatterns.entries(); _i < _b.length; _i++) {
            var _c = _b[_i], semanticType = _c[0], patterns = _c[1];
            for (var _d = 0, patterns_1 = patterns; _d < patterns_1.length; _d++) {
                var pattern = patterns_1[_d];
                if (pattern.test(searchText)) {
                    var currentScore = scores.get(semanticType) || 0;
                    scores.set(semanticType, currentScore + 0.8);
                    reasoning.push("Attribute pattern match for ".concat(semanticType, ": ").concat(pattern.source));
                }
            }
        }
        // Boost scores for input types
        if (type === 'email') {
            scores.set(SemanticFieldType.EMAIL, (scores.get(SemanticFieldType.EMAIL) || 0) + 1.0);
            reasoning.push('Input type is email');
        }
        else if (type === 'tel') {
            scores.set(SemanticFieldType.PHONE, (scores.get(SemanticFieldType.PHONE) || 0) + 1.0);
            reasoning.push('Input type is tel');
        }
        else if (type === 'file') {
            scores.set(SemanticFieldType.RESUME, (scores.get(SemanticFieldType.RESUME) || 0) + 0.8);
            reasoning.push('Input type is file (likely resume)');
        }
    };
    FormAnalyzer.prototype.analyzeByLabels = function (element, scores, reasoning) {
        var labelText = element.labels.join(' ').toLowerCase();
        for (var _i = 0, _a = this.contextualKeywords.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], semanticType = _b[0], keywords = _b[1];
            for (var _c = 0, keywords_1 = keywords; _c < keywords_1.length; _c++) {
                var keyword = keywords_1[_c];
                if (labelText.includes(keyword.toLowerCase())) {
                    var currentScore = scores.get(semanticType) || 0;
                    scores.set(semanticType, currentScore + 0.6);
                    reasoning.push("Label keyword match for ".concat(semanticType, ": \"").concat(keyword, "\""));
                }
            }
        }
    };
    FormAnalyzer.prototype.analyzeByContext = function (element, scores, reasoning) {
        // Context analysis would look at nearby elements, section headings, etc.
        // For now, implementing basic placeholder detection
        var placeholder = element.placeholder.toLowerCase();
        if (placeholder.includes('first name')) {
            scores.set(SemanticFieldType.FIRST_NAME, (scores.get(SemanticFieldType.FIRST_NAME) || 0) + 0.9);
            reasoning.push('Placeholder indicates first name');
        }
        else if (placeholder.includes('last name')) {
            scores.set(SemanticFieldType.LAST_NAME, (scores.get(SemanticFieldType.LAST_NAME) || 0) + 0.9);
            reasoning.push('Placeholder indicates last name');
        }
    };
    FormAnalyzer.prototype.analyzeByElementProperties = function (element, scores, reasoning) {
        // Analyze based on validation rules, max length, etc.
        if (element.validation.some(function (rule) { var _a; return rule.type === 'pattern' && ((_a = rule.value) === null || _a === void 0 ? void 0 : _a.toString().includes('@')); })) {
            scores.set(SemanticFieldType.EMAIL, (scores.get(SemanticFieldType.EMAIL) || 0) + 0.7);
            reasoning.push('Email pattern validation detected');
        }
    };
    // =============================================================================
    // HELPER METHODS
    // =============================================================================
    FormAnalyzer.prototype.initializeSemanticPatterns = function () {
        this.semanticPatterns.set(SemanticFieldType.FIRST_NAME, [
            /first.*name|fname|given.*name/i,
            /^name\.first|^firstName/i
        ]);
        this.semanticPatterns.set(SemanticFieldType.LAST_NAME, [
            /last.*name|lname|family.*name|surname/i,
            /^name\.last|^lastName/i
        ]);
        this.semanticPatterns.set(SemanticFieldType.EMAIL, [
            /email|e-mail|mail/i,
            /^email|contact.*email/i
        ]);
        this.semanticPatterns.set(SemanticFieldType.PHONE, [
            /phone|tel|mobile|cell/i,
            /^phone|contact.*phone/i
        ]);
        // Initialize contextual keywords
        this.contextualKeywords.set(SemanticFieldType.FIRST_NAME, [
            'First Name', 'Given Name', 'Forename'
        ]);
        this.contextualKeywords.set(SemanticFieldType.LAST_NAME, [
            'Last Name', 'Family Name', 'Surname'
        ]);
        this.contextualKeywords.set(SemanticFieldType.EMAIL, [
            'Email Address', 'Email', 'Contact Email'
        ]);
        this.contextualKeywords.set(SemanticFieldType.PHONE, [
            'Phone Number', 'Mobile Number', 'Contact Number'
        ]);
    };
    FormAnalyzer.prototype.createElementMapping = function (element, userProfile) {
        return __awaiter(this, void 0, void 0, function () {
            var semantic, userDataField, value;
            return __generator(this, function (_a) {
                semantic = element.semanticMeaning;
                if (semantic.confidence < 0.5) {
                    return [2 /*return*/, null]; // Too uncertain to map
                }
                // Map semantic meaning to user profile fields
                switch (semantic.fieldType) {
                    case SemanticFieldType.FIRST_NAME:
                        userDataField = 'personalInfo.firstName';
                        value = userProfile.personalInfo.firstName;
                        break;
                    case SemanticFieldType.LAST_NAME:
                        userDataField = 'personalInfo.lastName';
                        value = userProfile.personalInfo.lastName;
                        break;
                    case SemanticFieldType.EMAIL:
                        userDataField = 'personalInfo.email';
                        value = userProfile.personalInfo.email;
                        break;
                    case SemanticFieldType.PHONE:
                        userDataField = 'personalInfo.phone';
                        value = userProfile.personalInfo.phone;
                        break;
                    case SemanticFieldType.RESUME:
                        userDataField = 'professional.resumeUrl';
                        value = userProfile.professional.resumeUrl;
                        break;
                    default:
                        return [2 /*return*/, null]; // Unsupported field type
                }
                if (!value) {
                    return [2 /*return*/, null]; // No data available
                }
                return [2 /*return*/, {
                        elementId: element.id,
                        userDataField: userDataField,
                        value: value,
                        confidence: semantic.confidence,
                        transformations: this.generateTransformations(element, value)
                    }];
            });
        });
    };
    FormAnalyzer.prototype.generateTransformations = function (element, value) {
        var transformations = [];
        // Add format transformations based on element type
        if (element.type === FormElementType.PHONE_INPUT && typeof value === 'string') {
            transformations.push({
                type: 'format',
                rule: 'phone-us-format'
            });
        }
        return transformations;
    };
    FormAnalyzer.prototype.fillFormElement = function (page, element, mapping) {
        return __awaiter(this, void 0, void 0, function () {
            var pageElement, value, _i, _a, transformation, _b, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, , 11]);
                        pageElement = page.locator(element.selector);
                        value = mapping.value;
                        for (_i = 0, _a = mapping.transformations; _i < _a.length; _i++) {
                            transformation = _a[_i];
                            value = this.applyTransformation(value, transformation);
                        }
                        _b = element.type;
                        switch (_b) {
                            case FormElementType.TEXT_INPUT: return [3 /*break*/, 1];
                            case FormElementType.EMAIL_INPUT: return [3 /*break*/, 1];
                            case FormElementType.PHONE_INPUT: return [3 /*break*/, 1];
                            case FormElementType.FILE_UPLOAD: return [3 /*break*/, 3];
                            case FormElementType.SELECT: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 1: return [4 /*yield*/, pageElement.fill(String(value))];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 3:
                        if (!(typeof value === 'string' && value.startsWith('/'))) return [3 /*break*/, 5];
                        return [4 /*yield*/, pageElement.setInputFiles(value)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, pageElement.selectOption(String(value))];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 8: throw new Error("Unsupported element type: ".concat(element.type));
                    case 9: return [2 /*return*/, {
                            elementId: element.id,
                            success: true
                        }];
                    case 10:
                        error_6 = _c.sent();
                        return [2 /*return*/, {
                                elementId: element.id,
                                success: false,
                                error: error_6 instanceof Error ? error_6.message : String(error_6)
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    FormAnalyzer.prototype.applyTransformation = function (value, transformation) {
        switch (transformation.type) {
            case 'format':
                if (transformation.rule === 'phone-us-format') {
                    return this.formatPhoneNumber(value);
                }
                break;
            default:
                return value;
        }
        return value;
    };
    FormAnalyzer.prototype.formatPhoneNumber = function (phone) {
        // Simple US phone formatting
        var digits = phone.replace(/\D/g, '');
        if (digits.length === 10) {
            return "(".concat(digits.slice(0, 3), ") ").concat(digits.slice(3, 6), "-").concat(digits.slice(6));
        }
        return phone;
    };
    FormAnalyzer.prototype.naturalDelay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                delay = Math.random() * 1000 + 500;
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
            });
        });
    };
    FormAnalyzer.prototype.determineElementType = function (tagName, attributes) {
        if (tagName === 'input') {
            switch (attributes.type) {
                case 'email': return FormElementType.EMAIL_INPUT;
                case 'tel': return FormElementType.PHONE_INPUT;
                case 'password': return FormElementType.PASSWORD_INPUT;
                case 'file': return FormElementType.FILE_UPLOAD;
                case 'date': return FormElementType.DATE_INPUT;
                case 'number': return FormElementType.NUMBER_INPUT;
                case 'checkbox': return FormElementType.CHECKBOX;
                case 'radio': return FormElementType.RADIO;
                default: return FormElementType.TEXT_INPUT;
            }
        }
        else if (tagName === 'textarea') {
            return FormElementType.TEXTAREA;
        }
        else if (tagName === 'select') {
            return FormElementType.SELECT;
        }
        else if (tagName === 'button') {
            return FormElementType.SUBMIT_BUTTON;
        }
        return FormElementType.UNKNOWN;
    };
    FormAnalyzer.prototype.getElementAttributes = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.evaluate(function (el) {
                            var attrs = {};
                            for (var _i = 0, _a = el.attributes; _i < _a.length; _i++) {
                                var attr = _a[_i];
                                attrs[attr.name] = attr.value;
                            }
                            return attrs;
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FormAnalyzer.prototype.getElementLabels = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.evaluate(function (el) {
                            var _a, _b;
                            var labels = [];
                            // Direct label association
                            if (el.id) {
                                var label = document.querySelector("label[for=\"".concat(el.id, "\"]"));
                                if (label) {
                                    labels.push(((_a = label.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '');
                                }
                            }
                            // Parent label
                            var parentLabel = el.closest('label');
                            if (parentLabel) {
                                labels.push(((_b = parentLabel.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '');
                            }
                            // Nearby text (previous sibling, etc.)
                            var prevSibling = el.previousElementSibling;
                            if (prevSibling && prevSibling.textContent) {
                                labels.push(prevSibling.textContent.trim());
                            }
                            return labels.filter(function (label) { return label.length > 0; });
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FormAnalyzer.prototype.getElementPosition = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            var box, isVisible;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.boundingBox()];
                    case 1:
                        box = _a.sent();
                        return [4 /*yield*/, element.isVisible()];
                    case 2:
                        isVisible = _a.sent();
                        return [2 /*return*/, {
                                x: (box === null || box === void 0 ? void 0 : box.x) || 0,
                                y: (box === null || box === void 0 ? void 0 : box.y) || 0,
                                width: (box === null || box === void 0 ? void 0 : box.width) || 0,
                                height: (box === null || box === void 0 ? void 0 : box.height) || 0,
                                isVisible: isVisible,
                                zIndex: 0 // Would need additional logic to get z-index
                            }];
                }
            });
        });
    };
    FormAnalyzer.prototype.getVisibilityInfo = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.evaluate(function (el) {
                            var style = window.getComputedStyle(el);
                            return {
                                visible: el.offsetParent !== null,
                                hidden: el.hidden,
                                display: style.display,
                                opacity: parseFloat(style.opacity)
                            };
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FormAnalyzer.prototype.generateUniqueSelector = function (element) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, element.evaluate(function (el) {
                            // Generate a unique selector for this element
                            if (el.id) {
                                return "#".concat(el.id);
                            }
                            if (el.name) {
                                return "".concat(el.tagName.toLowerCase(), "[name=\"").concat(el.name, "\"]");
                            }
                            // Fallback to nth-child selector
                            var parent = el.parentElement;
                            if (parent) {
                                var siblings = Array.from(parent.children);
                                var index = siblings.indexOf(el);
                                return "".concat(parent.tagName.toLowerCase(), " > ").concat(el.tagName.toLowerCase(), ":nth-child(").concat(index + 1, ")");
                            }
                            return el.tagName.toLowerCase();
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FormAnalyzer.prototype.extractValidationRules = function (attributes) {
        var rules = [];
        if ('required' in attributes || attributes.required === 'true') {
            rules.push({ type: 'required' });
        }
        if (attributes.pattern) {
            rules.push({
                type: 'pattern',
                value: attributes.pattern
            });
        }
        if (attributes.maxlength) {
            rules.push({
                type: 'length',
                value: parseInt(attributes.maxlength)
            });
        }
        return rules;
    };
    // Placeholder implementations for other methods
    FormAnalyzer.prototype.identifyFormSections = function (elements, page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Implementation would group elements into logical sections
            });
        });
    };
    FormAnalyzer.prototype.analyzeFormFlow = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        steps: [],
                        currentStep: 0,
                        canNavigateBack: false,
                        canNavigateForward: false
                    }];
            });
        });
    };
    FormAnalyzer.prototype.analyzeValidation = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        clientSide: false,
                        serverSide: false,
                        realTimeValidation: false,
                        validationSelectors: []
                    }];
            });
        });
    };
    FormAnalyzer.prototype.extractMetadata = function (page, elements) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        company: 'Unknown',
                        formType: 'application',
                        estimatedFillTime: elements.length * 2000, // 2 seconds per field
                        complexity: elements.length > 20 ? 'complex' : elements.length > 10 ? 'medium' : 'simple',
                        language: 'en'
                    }];
            });
        });
    };
    FormAnalyzer.prototype.createValidationChecks = function (element) {
        return []; // Implementation would create validation checks
    };
    FormAnalyzer.prototype.optimizeFillOrder = function (fillOrder, schema) {
        return fillOrder; // Implementation would optimize based on form flow
    };
    FormAnalyzer.prototype.estimateFillTime = function (mappings, schema) {
        return mappings.length * 1500; // 1.5 seconds per field
    };
    FormAnalyzer.prototype.runValidationChecks = function (page, checks) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Implementation would run validation checks
            });
        });
    };
    FormAnalyzer.prototype.generateCacheKey = function (url) {
        return url.split('?')[0]; // Remove query parameters for caching
    };
    FormAnalyzer.prototype.isCacheValid = function (schema) {
        var maxAge = 24 * 60 * 60 * 1000; // 24 hours
        return Date.now() - schema.timestamp.getTime() < maxAge;
    };
    FormAnalyzer.prototype.loadCachedData = function () {
        // Load cached patterns and mappings
    };
    return FormAnalyzer;
}(events_1.EventEmitter));
exports.FormAnalyzer = FormAnalyzer;
