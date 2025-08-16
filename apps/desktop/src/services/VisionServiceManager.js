"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.VisionServiceManager = void 0;
var events_1 = require("events");
var lru_cache_1 = require("lru-cache");
// Provider imports
var sdk_1 = require("@anthropic-ai/sdk");
var vision_1 = require("@google-cloud/vision");
var ai_form_recognizer_1 = require("@azure/ai-form-recognizer");
var client_textract_1 = require("@aws-sdk/client-textract");
var tesseract_js_1 = require("tesseract.js");
var openai_1 = require("openai");
var VisionServiceManager = /** @class */ (function (_super) {
    __extends(VisionServiceManager, _super);
    function VisionServiceManager(config) {
        var _this = _super.call(this) || this;
        _this.providers = new Map();
        _this.clients = new Map();
        _this.config = config;
        _this.cache = new lru_cache_1.LRUCache({
            max: config.caching.maxSize,
            ttl: config.caching.ttl,
        });
        _this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            totalCost: 0,
            averageAccuracy: 0,
            providerUsage: new Map(),
            cacheHitRate: 0,
        };
        _this.initializeProviders();
        return _this;
    }
    /**
     * Initialize all available vision providers
     */
    VisionServiceManager.prototype.initializeProviders = function () {
        var _a, _b, _c, _d, _e;
        // Tier 1: Claude Vision (Primary AI-powered analysis)
        this.providers.set('claude-vision', {
            name: 'claude-vision',
            enabled: !!((_a = this.config.providers.claude) === null || _a === void 0 ? void 0 : _a.apiKey),
            priority: 1,
            cost: 0.002,
            accuracy: 0.92,
            speed: 'fast',
            languages: 100,
            config: this.config.providers.claude,
        });
        // Tier 2: Google Cloud Vision (Highest OCR accuracy)
        this.providers.set('google-vision', {
            name: 'google-vision',
            enabled: !!((_b = this.config.providers.google) === null || _b === void 0 ? void 0 : _b.keyFilename),
            priority: 2,
            cost: 0.0015,
            accuracy: 0.98,
            speed: 'fast',
            languages: 200,
            config: this.config.providers.google,
        });
        // Tier 3: Azure Document Intelligence (Best for structured forms)
        this.providers.set('azure-document-ai', {
            name: 'azure-document-ai',
            enabled: !!((_c = this.config.providers.azure) === null || _c === void 0 ? void 0 : _c.apiKey),
            priority: 3,
            cost: 0.002,
            accuracy: 0.95,
            speed: 'medium',
            languages: 164,
            config: this.config.providers.azure,
        });
        // Tier 4: AWS Textract (Advanced form field extraction)
        this.providers.set('aws-textract', {
            name: 'aws-textract',
            enabled: !!((_d = this.config.providers.aws) === null || _d === void 0 ? void 0 : _d.accessKeyId),
            priority: 4,
            cost: 0.0015,
            accuracy: 0.94,
            speed: 'medium',
            languages: 50,
            config: this.config.providers.aws,
        });
        // Tier 5: Tesseract OCR (Free open-source fallback)
        this.providers.set('tesseract-ocr', {
            name: 'tesseract-ocr',
            enabled: true, // Always available
            priority: 5,
            cost: 0,
            accuracy: 0.85,
            speed: 'slow',
            languages: 100,
        });
        // Tier 6: GPT-4 Vision (Specialized document processing)
        this.providers.set('gpt-4-vision', {
            name: 'gpt-4-vision',
            enabled: !!((_e = this.config.providers.openai) === null || _e === void 0 ? void 0 : _e.apiKey),
            priority: 6,
            cost: 0.005,
            accuracy: 0.96,
            speed: 'slow',
            languages: 50,
            config: this.config.providers.openai,
        });
        this.initializeClients();
    };
    /**
     * Initialize API clients for enabled providers
     */
    VisionServiceManager.prototype.initializeClients = function () {
        return __awaiter(this, void 0, void 0, function () {
            var claudeClient, googleClient, azureClient, awsClient, openaiClient;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                try {
                    // Initialize Claude client
                    if ((_a = this.providers.get('claude-vision')) === null || _a === void 0 ? void 0 : _a.enabled) {
                        claudeClient = new sdk_1.Anthropic({
                            apiKey: this.config.providers.claude.apiKey,
                        });
                        this.clients.set('claude-vision', claudeClient);
                    }
                    // Initialize Google Vision client
                    if ((_b = this.providers.get('google-vision')) === null || _b === void 0 ? void 0 : _b.enabled) {
                        googleClient = new vision_1.ImageAnnotatorClient({
                            keyFilename: this.config.providers.google.keyFilename,
                            projectId: this.config.providers.google.projectId,
                        });
                        this.clients.set('google-vision', googleClient);
                    }
                    // Initialize Azure client
                    if ((_c = this.providers.get('azure-document-ai')) === null || _c === void 0 ? void 0 : _c.enabled) {
                        azureClient = new ai_form_recognizer_1.FormRecognizerClient(this.config.providers.azure.endpoint, new ai_form_recognizer_1.AzureKeyCredential(this.config.providers.azure.apiKey));
                        this.clients.set('azure-document-ai', azureClient);
                    }
                    // Initialize AWS Textract client
                    if ((_d = this.providers.get('aws-textract')) === null || _d === void 0 ? void 0 : _d.enabled) {
                        awsClient = new client_textract_1.TextractClient({
                            region: this.config.providers.aws.region,
                            credentials: {
                                accessKeyId: this.config.providers.aws.accessKeyId,
                                secretAccessKey: this.config.providers.aws.secretAccessKey,
                            },
                        });
                        this.clients.set('aws-textract', awsClient);
                    }
                    // Initialize OpenAI client
                    if ((_e = this.providers.get('gpt-4-vision')) === null || _e === void 0 ? void 0 : _e.enabled) {
                        openaiClient = new openai_1.OpenAI({
                            apiKey: this.config.providers.openai.apiKey,
                        });
                        this.clients.set('gpt-4-vision', openaiClient);
                    }
                    this.emit('initialized', {
                        enabledProviders: Array.from(this.providers.values()).filter(function (p) { return p.enabled; }).length
                    });
                }
                catch (error) {
                    this.emit('error', { phase: 'initialization', error: error.message });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze image/document using the best available provider
     */
    VisionServiceManager.prototype.analyzeImage = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cacheKey, cachedResult, selectedProvider, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        this.stats.totalRequests++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        this.emit('analysis-start', {
                            analysisType: request.analysisType,
                            imageSize: typeof request.image === 'string' ? request.image.length : request.image.byteLength
                        });
                        cacheKey = this.generateCacheKey(request);
                        if (this.config.caching.enabled) {
                            cachedResult = this.cache.get(cacheKey);
                            if (cachedResult) {
                                this.stats.cacheHitRate = (this.stats.cacheHitRate + 1) / 2;
                                return [2 /*return*/, __assign(__assign({}, cachedResult), { executionTime: Date.now() - startTime, metadata: __assign(__assign({}, cachedResult.metadata), { cacheHit: true }) })];
                            }
                        }
                        selectedProvider = this.selectOptimalProvider(request);
                        if (!selectedProvider) {
                            throw new Error('No suitable vision provider available');
                        }
                        return [4 /*yield*/, this.processWithProvider(selectedProvider, request)];
                    case 2:
                        result = _a.sent();
                        if (!(!result.success && this.config.fallback.enabled)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.applyFallbackStrategy(request, [selectedProvider.name])];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        // Cache successful results
                        if (result.success && this.config.caching.enabled) {
                            this.cache.set(cacheKey, result);
                        }
                        // Update statistics
                        this.updateStats(result);
                        result.executionTime = Date.now() - startTime;
                        this.emit('analysis-complete', {
                            provider: result.provider,
                            success: result.success,
                            executionTime: result.executionTime
                        });
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _a.sent();
                        this.emit('error', { phase: 'analysis', error: error_1.message });
                        return [2 /*return*/, {
                                success: false,
                                provider: 'none',
                                confidence: 0,
                                executionTime: Date.now() - startTime,
                                cost: 0,
                                error: error_1.message,
                                metadata: {
                                    imageSize: typeof request.image === 'string' ? request.image.length : request.image.byteLength,
                                    processingSteps: ['error'],
                                    fallbacksUsed: [],
                                    cacheHit: false,
                                }
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Select the optimal provider based on request requirements and provider capabilities
     */
    VisionServiceManager.prototype.selectOptimalProvider = function (request) {
        var _a, _b;
        var availableProviders = Array.from(this.providers.values())
            .filter(function (p) { return p.enabled; })
            .sort(function (a, b) { return a.priority - b.priority; });
        if (availableProviders.length === 0) {
            return null;
        }
        // Apply user preferences
        if ((_b = (_a = request.options) === null || _a === void 0 ? void 0 : _a.preferredProviders) === null || _b === void 0 ? void 0 : _b.length) {
            var _loop_1 = function (preferred) {
                var provider = availableProviders.find(function (p) { return p.name === preferred; });
                if (provider && this_1.meetsRequirements(provider, request)) {
                    return { value: provider };
                }
            };
            var this_1 = this;
            for (var _i = 0, _c = request.options.preferredProviders; _i < _c.length; _i++) {
                var preferred = _c[_i];
                var state_1 = _loop_1(preferred);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        // Apply optimization rules
        if (this.config.optimization.preferFreeProviders) {
            var freeProvider = availableProviders.find(function (p) { return p.cost === 0; });
            if (freeProvider && this.meetsRequirements(freeProvider, request)) {
                return freeProvider;
            }
        }
        // Find provider that meets requirements
        for (var _d = 0, availableProviders_1 = availableProviders; _d < availableProviders_1.length; _d++) {
            var provider = availableProviders_1[_d];
            if (this.meetsRequirements(provider, request)) {
                return provider;
            }
        }
        // Fallback to first available provider
        return availableProviders[0];
    };
    /**
     * Check if provider meets request requirements
     */
    VisionServiceManager.prototype.meetsRequirements = function (provider, request) {
        var options = request.options || {};
        // Cost check
        if (options.maxCost && provider.cost > options.maxCost) {
            return false;
        }
        // Accuracy check
        if (options.requireHighAccuracy && provider.accuracy < 0.95) {
            return false;
        }
        // Speed check for urgent processing
        if (options.urgentProcessing && provider.speed === 'slow') {
            return false;
        }
        return true;
    };
    /**
     * Process request with specific provider
     */
    VisionServiceManager.prototype.processWithProvider = function (provider, request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result, _a, currentUsage, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 16, , 17]);
                        this.emit('provider-start', { provider: provider.name });
                        result = void 0;
                        _a = provider.name;
                        switch (_a) {
                            case 'claude-vision': return [3 /*break*/, 2];
                            case 'google-vision': return [3 /*break*/, 4];
                            case 'azure-document-ai': return [3 /*break*/, 6];
                            case 'aws-textract': return [3 /*break*/, 8];
                            case 'tesseract-ocr': return [3 /*break*/, 10];
                            case 'gpt-4-vision': return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, this.processWithClaude(request)];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 4: return [4 /*yield*/, this.processWithGoogle(request)];
                    case 5:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 6: return [4 /*yield*/, this.processWithAzure(request)];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 8: return [4 /*yield*/, this.processWithAWS(request)];
                    case 9:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 10: return [4 /*yield*/, this.processWithTesseract(request)];
                    case 11:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 12: return [4 /*yield*/, this.processWithGPT4V(request)];
                    case 13:
                        result = _b.sent();
                        return [3 /*break*/, 15];
                    case 14: throw new Error("Unknown provider: ".concat(provider.name));
                    case 15:
                        result.provider = provider.name;
                        result.cost = provider.cost;
                        result.executionTime = Date.now() - startTime;
                        currentUsage = this.stats.providerUsage.get(provider.name) || 0;
                        this.stats.providerUsage.set(provider.name, currentUsage + 1);
                        this.emit('provider-complete', {
                            provider: provider.name,
                            success: result.success,
                            confidence: result.confidence
                        });
                        return [2 /*return*/, result];
                    case 16:
                        error_2 = _b.sent();
                        this.emit('provider-error', { provider: provider.name, error: error_2.message });
                        throw error_2;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process with Claude Vision API
     */
    VisionServiceManager.prototype.processWithClaude = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var client, prompt, imageData, response, analysisText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.clients.get('claude-vision');
                        prompt = this.generatePromptForAnalysisType(request.analysisType, request.context);
                        imageData = typeof request.image === 'string' ? request.image : request.image.toString('base64');
                        return [4 /*yield*/, client.messages.create({
                                model: 'claude-3-5-sonnet-20241022',
                                max_tokens: 4000,
                                messages: [{
                                        role: 'user',
                                        content: [
                                            { type: 'text', text: prompt },
                                            {
                                                type: 'image',
                                                source: {
                                                    type: 'base64',
                                                    media_type: "image/".concat(request.imageType),
                                                    data: imageData,
                                                },
                                            },
                                        ],
                                    }],
                            })];
                    case 1:
                        response = _a.sent();
                        analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
                        return [2 /*return*/, this.parseClaudeResponse(analysisText, request.analysisType)];
                }
            });
        });
    };
    /**
     * Process with Google Cloud Vision API
     */
    VisionServiceManager.prototype.processWithGoogle = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var client, imageBuffer, result, textAnnotations, fullText;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = this.clients.get('google-vision');
                        imageBuffer = typeof request.image === 'string'
                            ? Buffer.from(request.image, 'base64')
                            : request.image;
                        return [4 /*yield*/, client.textDetection({
                                image: { content: imageBuffer.toString('base64') },
                            })];
                    case 1:
                        result = (_b.sent())[0];
                        textAnnotations = result.textAnnotations || [];
                        fullText = ((_a = textAnnotations[0]) === null || _a === void 0 ? void 0 : _a.description) || '';
                        return [2 /*return*/, {
                                success: true,
                                provider: 'google-vision',
                                confidence: 0.98,
                                extractedText: fullText,
                                textBlocks: textAnnotations.slice(1).map(function (annotation) {
                                    var _a, _b, _c, _d;
                                    return ({
                                        text: annotation.description || '',
                                        confidence: 0.95,
                                        coordinates: ((_b = (_a = annotation.boundingPoly) === null || _a === void 0 ? void 0 : _a.vertices) === null || _b === void 0 ? void 0 : _b[0]) ? {
                                            x: annotation.boundingPoly.vertices[0].x || 0,
                                            y: annotation.boundingPoly.vertices[0].y || 0,
                                            width: (((_c = annotation.boundingPoly.vertices[2]) === null || _c === void 0 ? void 0 : _c.x) || 0) - (annotation.boundingPoly.vertices[0].x || 0),
                                            height: (((_d = annotation.boundingPoly.vertices[2]) === null || _d === void 0 ? void 0 : _d.y) || 0) - (annotation.boundingPoly.vertices[0].y || 0),
                                        } : undefined,
                                    });
                                }),
                                executionTime: 0,
                                cost: 0.0015,
                                metadata: {
                                    imageSize: imageBuffer.length,
                                    processingSteps: ['google-vision-ocr'],
                                    fallbacksUsed: [],
                                    cacheHit: false,
                                },
                            }];
                }
            });
        });
    };
    /**
     * Process with Azure Document Intelligence
     */
    VisionServiceManager.prototype.processWithAzure = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var client, imageBuffer, poller, result, formFields;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = this.clients.get('azure-document-ai');
                        imageBuffer = typeof request.image === 'string'
                            ? Buffer.from(request.image, 'base64')
                            : request.image;
                        return [4 /*yield*/, client.beginAnalyzeDocument('prebuilt-layout', imageBuffer)];
                    case 1:
                        poller = _b.sent();
                        return [4 /*yield*/, poller.pollUntilDone()];
                    case 2:
                        result = _b.sent();
                        formFields = [];
                        // Extract fields from Azure response
                        (_a = result.keyValuePairs) === null || _a === void 0 ? void 0 : _a.forEach(function (pair, index) {
                            if (pair.key && pair.value) {
                                formFields.push({
                                    id: "field_".concat(index),
                                    type: 'text',
                                    label: pair.key.content || "Field ".concat(index),
                                    value: pair.value.content || '',
                                    required: false,
                                    confidence: pair.confidence || 0.5,
                                    semanticType: 'other',
                                });
                            }
                        });
                        return [2 /*return*/, {
                                success: true,
                                provider: 'azure-document-ai',
                                confidence: 0.95,
                                formFields: formFields,
                                extractedText: result.content || '',
                                executionTime: 0,
                                cost: 0.002,
                                metadata: {
                                    imageSize: imageBuffer.length,
                                    processingSteps: ['azure-document-analysis'],
                                    fallbacksUsed: [],
                                    cacheHit: false,
                                },
                            }];
                }
            });
        });
    };
    /**
     * Process with AWS Textract
     */
    VisionServiceManager.prototype.processWithAWS = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var client, imageBuffer, command, response, formFields, textBlocks;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = this.clients.get('aws-textract');
                        imageBuffer = typeof request.image === 'string'
                            ? Buffer.from(request.image, 'base64')
                            : request.image;
                        command = new client_textract_1.AnalyzeDocumentCommand({
                            Document: { Bytes: imageBuffer },
                            FeatureTypes: ['FORMS', 'TABLES'],
                        });
                        return [4 /*yield*/, client.send(command)];
                    case 1:
                        response = _b.sent();
                        formFields = [];
                        textBlocks = [];
                        // Process blocks from AWS response
                        (_a = response.Blocks) === null || _a === void 0 ? void 0 : _a.forEach(function (block, index) {
                            var _a, _b;
                            if (block.BlockType === 'LINE' && block.Text) {
                                textBlocks.push({
                                    text: block.Text,
                                    confidence: block.Confidence || 0,
                                });
                            }
                            if (block.BlockType === 'KEY_VALUE_SET' && ((_a = block.EntityTypes) === null || _a === void 0 ? void 0 : _a.includes('KEY'))) {
                                // Find corresponding value block
                                var valueBlock = (_b = response.Blocks) === null || _b === void 0 ? void 0 : _b.find(function (b) {
                                    var _a, _b;
                                    return b.BlockType === 'KEY_VALUE_SET' &&
                                        ((_a = b.EntityTypes) === null || _a === void 0 ? void 0 : _a.includes('VALUE')) &&
                                        ((_b = block.Relationships) === null || _b === void 0 ? void 0 : _b.some(function (rel) { var _a; return (_a = rel.Ids) === null || _a === void 0 ? void 0 : _a.includes(b.Id || ''); }));
                                });
                                if (valueBlock) {
                                    formFields.push({
                                        id: "aws_field_".concat(index),
                                        type: 'text',
                                        label: block.Text || "Field ".concat(index),
                                        value: valueBlock.Text || '',
                                        required: false,
                                        confidence: (block.Confidence || 0) / 100,
                                        semanticType: 'other',
                                    });
                                }
                            }
                        });
                        return [2 /*return*/, {
                                success: true,
                                provider: 'aws-textract',
                                confidence: 0.94,
                                formFields: formFields,
                                textBlocks: textBlocks,
                                extractedText: textBlocks.map(function (b) { return b.text; }).join('\n'),
                                executionTime: 0,
                                cost: 0.0015,
                                metadata: {
                                    imageSize: imageBuffer.length,
                                    processingSteps: ['aws-textract-analysis'],
                                    fallbacksUsed: [],
                                    cacheHit: false,
                                },
                            }];
                }
            });
        });
    };
    /**
     * Process with Tesseract OCR
     */
    VisionServiceManager.prototype.processWithTesseract = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var worker, imageBuffer, _a, text, confidence;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, tesseract_js_1.createWorker)('eng')];
                    case 1:
                        worker = _b.sent();
                        imageBuffer = typeof request.image === 'string'
                            ? Buffer.from(request.image, 'base64')
                            : request.image;
                        return [4 /*yield*/, worker.recognize(imageBuffer)];
                    case 2:
                        _a = (_b.sent()).data, text = _a.text, confidence = _a.confidence;
                        return [4 /*yield*/, worker.terminate()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                provider: 'tesseract-ocr',
                                confidence: confidence / 100,
                                extractedText: text,
                                executionTime: 0,
                                cost: 0,
                                metadata: {
                                    imageSize: imageBuffer.length,
                                    processingSteps: ['tesseract-ocr'],
                                    fallbacksUsed: [],
                                    cacheHit: false,
                                },
                            }];
                }
            });
        });
    };
    /**
     * Process with GPT-4 Vision
     */
    VisionServiceManager.prototype.processWithGPT4V = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var client, prompt, imageData, response, analysisText;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        client = this.clients.get('gpt-4-vision');
                        prompt = this.generatePromptForAnalysisType(request.analysisType, request.context);
                        imageData = typeof request.image === 'string' ? request.image : request.image.toString('base64');
                        return [4 /*yield*/, client.chat.completions.create({
                                model: 'gpt-4-vision-preview',
                                messages: [{
                                        role: 'user',
                                        content: [
                                            { type: 'text', text: prompt },
                                            {
                                                type: 'image_url',
                                                image_url: {
                                                    url: "data:image/".concat(request.imageType, ";base64,").concat(imageData),
                                                },
                                            },
                                        ],
                                    }],
                                max_tokens: 4000,
                            })];
                    case 1:
                        response = _c.sent();
                        analysisText = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                        return [2 /*return*/, this.parseGPT4VResponse(analysisText, request.analysisType)];
                }
            });
        });
    };
    /**
     * Apply fallback strategy when primary provider fails
     */
    VisionServiceManager.prototype.applyFallbackStrategy = function (request, usedProviders) {
        return __awaiter(this, void 0, void 0, function () {
            var availableProviders, _i, availableProviders_2, provider, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        availableProviders = Array.from(this.providers.values())
                            .filter(function (p) { return p.enabled && !usedProviders.includes(p.name); })
                            .sort(function (a, b) { return a.priority - b.priority; });
                        _i = 0, availableProviders_2 = availableProviders;
                        _a.label = 1;
                    case 1:
                        if (!(_i < availableProviders_2.length)) return [3 /*break*/, 6];
                        provider = availableProviders_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        this.emit('fallback-attempt', { provider: provider.name });
                        return [4 /*yield*/, this.processWithProvider(provider, request)];
                    case 3:
                        result = _a.sent();
                        if (result.success) {
                            result.metadata.fallbacksUsed = usedProviders;
                            return [2 /*return*/, result];
                        }
                        usedProviders.push(provider.name);
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.emit('fallback-error', { provider: provider.name, error: error_3.message });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error('All vision providers failed');
                }
            });
        });
    };
    /**
     * Generate appropriate prompt for analysis type
     */
    VisionServiceManager.prototype.generatePromptForAnalysisType = function (analysisType, context) {
        var prompts = {
            'form-analysis': "Analyze this form image and extract:\n        1. All form fields (input, select, checkbox, etc.)\n        2. Field labels and types\n        3. Required vs optional fields\n        4. Form structure and layout\n        5. Submit buttons and actions\n        \n        Return the information in a structured JSON format with field details, types, and semantic meaning.",
            'captcha-resolution': "Analyze this captcha image and provide:\n        1. Captcha type (reCAPTCHA, hCaptcha, image-based, text-based)\n        2. Instructions or challenge text\n        3. Solution if possible\n        4. Difficulty level\n        \n        If it's an image-based captcha (select traffic lights, cars, etc.), describe what needs to be selected.",
            'text-extraction': "Extract all text from this image with high accuracy:\n        1. All visible text content\n        2. Text hierarchy and structure\n        3. Any important formatting\n        4. Tables or structured data\n        \n        Preserve the original layout and formatting as much as possible.",
            'document-processing': "Analyze this document and extract:\n        1. Document type and structure\n        2. Key sections and headings\n        3. Important information and data\n        4. Tables, lists, and structured content\n        5. Metadata and document properties\n        \n        Provide a comprehensive analysis of the document content and structure."
        };
        return prompts[analysisType] || prompts['text-extraction'];
    };
    /**
     * Parse Claude response into structured result
     */
    VisionServiceManager.prototype.parseClaudeResponse = function (response, analysisType) {
        // Implementation for parsing Claude's response based on analysis type
        // This would parse the structured response from Claude
        return {
            success: true,
            provider: 'claude-vision',
            confidence: 0.92,
            extractedText: response,
            executionTime: 0,
            cost: 0.002,
            metadata: {
                imageSize: 0,
                processingSteps: ['claude-vision-analysis'],
                fallbacksUsed: [],
                cacheHit: false,
            },
        };
    };
    /**
     * Parse GPT-4V response into structured result
     */
    VisionServiceManager.prototype.parseGPT4VResponse = function (response, analysisType) {
        // Implementation for parsing GPT-4V response based on analysis type
        return {
            success: true,
            provider: 'gpt-4-vision',
            confidence: 0.96,
            extractedText: response,
            executionTime: 0,
            cost: 0.005,
            metadata: {
                imageSize: 0,
                processingSteps: ['gpt4v-analysis'],
                fallbacksUsed: [],
                cacheHit: false,
            },
        };
    };
    /**
     * Generate cache key for request
     */
    VisionServiceManager.prototype.generateCacheKey = function (request) {
        var imageHash = typeof request.image === 'string'
            ? request.image.substring(0, 32) // Use first 32 chars as hash
            : request.image.toString('base64').substring(0, 32);
        return "".concat(request.analysisType, ":").concat(imageHash, ":").concat(JSON.stringify(request.context || {}));
    };
    /**
     * Update service statistics
     */
    VisionServiceManager.prototype.updateStats = function (result) {
        if (result.success) {
            this.stats.successfulRequests++;
        }
        this.stats.totalCost += result.cost;
        // Update average accuracy (simple moving average)
        var alpha = 0.1;
        this.stats.averageAccuracy = this.stats.averageAccuracy * (1 - alpha) + result.confidence * alpha;
    };
    /**
     * Get service statistics
     */
    VisionServiceManager.prototype.getStats = function () {
        return __assign(__assign({}, this.stats), { enabledProviders: Array.from(this.providers.values())
                .filter(function (p) { return p.enabled; })
                .map(function (p) { return p.name; }) });
    };
    /**
     * Get provider status
     */
    VisionServiceManager.prototype.getProviderStatus = function () {
        var status = new Map();
        for (var _i = 0, _a = this.providers; _i < _a.length; _i++) {
            var _b = _a[_i], name_1 = _b[0], provider = _b[1];
            status.set(name_1, {
                enabled: provider.enabled,
                available: this.clients.has(name_1),
                stats: {
                    usage: this.stats.providerUsage.get(name_1) || 0,
                    cost: provider.cost,
                    accuracy: provider.accuracy,
                    speed: provider.speed,
                },
            });
        }
        return status;
    };
    /**
     * Clean up resources
     */
    VisionServiceManager.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.cache.clear();
                this.clients.clear();
                this.emit('cleanup', { message: 'Vision service manager cleaned up' });
                return [2 /*return*/];
            });
        });
    };
    return VisionServiceManager;
}(events_1.EventEmitter));
exports.VisionServiceManager = VisionServiceManager;
exports.default = VisionServiceManager;
