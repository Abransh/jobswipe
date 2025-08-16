"use strict";
/**
 * @fileoverview Strategy System Types and Interfaces
 * @description Type definitions for company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy management types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyEventType = exports.WorkflowAction = void 0;
var WorkflowAction;
(function (WorkflowAction) {
    WorkflowAction["NAVIGATE"] = "navigate";
    WorkflowAction["CLICK"] = "click";
    WorkflowAction["TYPE"] = "type";
    WorkflowAction["UPLOAD"] = "upload";
    WorkflowAction["SELECT"] = "select";
    WorkflowAction["WAIT"] = "wait";
    WorkflowAction["VALIDATE"] = "validate";
    WorkflowAction["EXTRACT"] = "extract";
    WorkflowAction["SCREENSHOT"] = "screenshot";
    WorkflowAction["CUSTOM"] = "custom";
})(WorkflowAction || (exports.WorkflowAction = WorkflowAction = {}));
var StrategyEventType;
(function (StrategyEventType) {
    StrategyEventType["STRATEGY_LOADED"] = "strategy-loaded";
    StrategyEventType["STRATEGY_MATCHED"] = "strategy-matched";
    StrategyEventType["EXECUTION_STARTED"] = "execution-started";
    StrategyEventType["STEP_COMPLETED"] = "step-completed";
    StrategyEventType["CAPTCHA_DETECTED"] = "captcha-detected";
    StrategyEventType["ERROR_OCCURRED"] = "error-occurred";
    StrategyEventType["EXECUTION_COMPLETED"] = "execution-completed";
    StrategyEventType["METRICS_UPDATED"] = "metrics-updated";
})(StrategyEventType || (exports.StrategyEventType = StrategyEventType = {}));
