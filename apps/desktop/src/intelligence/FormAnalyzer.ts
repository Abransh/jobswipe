/**
 * @fileoverview AI-Powered Form Intelligence System
 * @description Intelligent form field detection, analysis, and data mapping
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade form analysis with privacy protection
 */

import { EventEmitter } from 'events';
import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import Store from 'electron-store';
import LRU from 'lru-cache';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface FormElement {
  id: string;
  type: FormElementType;
  tag: string;
  selector: string;
  attributes: Record<string, string>;
  labels: string[];
  placeholder: string;
  value: string;
  required: boolean;
  validation: ValidationRule[];
  position: ElementPosition;
  visibility: VisibilityInfo;
  semanticMeaning: SemanticMeaning;
}

export enum FormElementType {
  TEXT_INPUT = 'text-input',
  EMAIL_INPUT = 'email-input',
  PHONE_INPUT = 'phone-input',
  PASSWORD_INPUT = 'password-input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE_UPLOAD = 'file-upload',
  DATE_INPUT = 'date-input',
  NUMBER_INPUT = 'number-input',
  SUBMIT_BUTTON = 'submit-button',
  UNKNOWN = 'unknown'
}

export interface ValidationRule {
  type: 'required' | 'pattern' | 'length' | 'custom';
  value?: string | number;
  message?: string;
}

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  isVisible: boolean;
  zIndex: number;
}

export interface VisibilityInfo {
  visible: boolean;
  hidden: boolean;
  display: string;
  opacity: number;
}

export interface SemanticMeaning {
  fieldType: SemanticFieldType;
  confidence: number;
  reasoning: string[];
  alternatives: SemanticFieldType[];
}

export enum SemanticFieldType {
  FIRST_NAME = 'first-name',
  LAST_NAME = 'last-name',
  FULL_NAME = 'full-name',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  CITY = 'city',
  STATE = 'state',
  ZIP_CODE = 'zip-code',
  COUNTRY = 'country',
  COMPANY = 'company',
  JOB_TITLE = 'job-title',
  EXPERIENCE_YEARS = 'experience-years',
  SALARY = 'salary',
  RESUME = 'resume',
  COVER_LETTER = 'cover-letter',
  LINKEDIN_URL = 'linkedin-url',
  PORTFOLIO_URL = 'portfolio-url',
  WORK_AUTHORIZATION = 'work-authorization',
  START_DATE = 'start-date',
  SKILLS = 'skills',
  EDUCATION = 'education',
  CUSTOM_QUESTION = 'custom-question',
  UNKNOWN = 'unknown'
}

export interface FormSchema {
  id: string;
  url: string;
  timestamp: Date;
  elements: FormElement[];
  sections: FormSection[];
  flow: FormFlow;
  validation: FormValidation;
  metadata: FormMetadata;
}

export interface FormSection {
  id: string;
  name: string;
  elements: string[]; // Element IDs
  order: number;
  required: boolean;
}

export interface FormFlow {
  steps: FormStep[];
  currentStep: number;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
}

export interface FormStep {
  id: string;
  name: string;
  sections: string[]; // Section IDs
  navigationElements: NavigationElement[];
}

export interface NavigationElement {
  type: 'next' | 'back' | 'submit' | 'skip';
  selector: string;
  text: string;
  enabled: boolean;
}

export interface FormValidation {
  clientSide: boolean;
  serverSide: boolean;
  realTimeValidation: boolean;
  validationSelectors: string[];
}

export interface FormMetadata {
  company: string;
  formType: 'application' | 'registration' | 'survey' | 'contact';
  estimatedFillTime: number;
  complexity: 'simple' | 'medium' | 'complex';
  language: string;
}

export interface DataMapping {
  elementId: string;
  userDataField: string;
  value: any;
  confidence: number;
  transformations: DataTransformation[];
}

export interface DataTransformation {
  type: 'format' | 'validate' | 'convert' | 'split';
  rule: string;
  target?: string;
}

export interface FormFillPlan {
  formId: string;
  mappings: DataMapping[];
  fillOrder: string[];
  validationChecks: ValidationCheck[];
  estimatedTime: number;
}

export interface ValidationCheck {
  elementId: string;
  checkType: 'format' | 'required' | 'length' | 'pattern';
  expected: any;
  message: string;
}

export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  professional: {
    currentTitle?: string;
    currentCompany?: string;
    yearsExperience?: number;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl: string;
    coverLetterTemplate?: string;
  };
  preferences: {
    salaryMin?: number;
    salaryMax?: number;
    remoteWork?: boolean;
    workAuthorization?: string;
    availableStartDate?: string;
  };
}

// =============================================================================
// FORM ANALYZER CLASS
// =============================================================================

export class FormAnalyzer extends EventEmitter {
  private store: Store;
  private schemaCache = new LRU<string, FormSchema>({ max: 1000 });
  private mappingCache = new LRU<string, FormFillPlan>({ max: 500 });
  private analysisCache = new LRU<string, SemanticMeaning>({ max: 2000 });
  
  // Semantic analysis patterns
  private semanticPatterns = new Map<SemanticFieldType, RegExp[]>();
  private contextualKeywords = new Map<SemanticFieldType, string[]>();

  constructor() {
    super();

    this.store = new Store({
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
    }) as any;

    this.initializeSemanticPatterns();
    this.loadCachedData();
  }

  // =============================================================================
  // MAIN ANALYSIS INTERFACE
  // =============================================================================

  /**
   * Analyze form and create comprehensive schema
   */
  async analyzeForm(page: Page, url?: string): Promise<FormSchema> {
    const analysisId = randomUUID();
    const startTime = Date.now();
    
    console.log(`🔍 [${analysisId}] Starting form analysis`);
    this.emit('analysis-started', { analysisId, url });

    try {
      // Generate cache key
      const pageUrl = url || page.url();
      const cacheKey = this.generateCacheKey(pageUrl);
      
      // Check cache first
      const cachedSchema = this.schemaCache.get(cacheKey);
      if (cachedSchema && this.isCacheValid(cachedSchema)) {
        console.log(`💾 [${analysisId}] Using cached schema`);
        return cachedSchema;
      }

      // Perform comprehensive form analysis
      const elements = await this.discoverFormElements(page);
      const sections = await this.identifyFormSections(elements, page);
      const flow = await this.analyzeFormFlow(page);
      const validation = await this.analyzeValidation(page);
      const metadata = await this.extractMetadata(page, elements);

      // Apply semantic analysis
      await this.applySemanticAnalysis(elements);

      const schema: FormSchema = {
        id: analysisId,
        url: pageUrl,
        timestamp: new Date(),
        elements,
        sections,
        flow,
        validation,
        metadata
      };

      // Cache the schema
      this.schemaCache.set(cacheKey, schema);

      const analysisTime = Date.now() - startTime;
      console.log(`✅ [${analysisId}] Form analysis completed in ${analysisTime}ms`);
      
      this.emit('analysis-completed', { 
        analysisId, 
        schema, 
        analysisTime,
        elementsFound: elements.length 
      });

      return schema;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [${analysisId}] Form analysis failed: ${errorMessage}`);
      
      this.emit('analysis-failed', { analysisId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Create data mapping plan for form filling
   */
  async createDataMappingPlan(
    schema: FormSchema, 
    userProfile: UserProfile
  ): Promise<FormFillPlan> {
    const planId = randomUUID();
    console.log(`📋 [${planId}] Creating data mapping plan`);

    try {
      const mappings: DataMapping[] = [];
      const fillOrder: string[] = [];
      const validationChecks: ValidationCheck[] = [];

      // Create mappings for each form element
      for (const element of schema.elements) {
        const mapping = await this.createElementMapping(element, userProfile);
        if (mapping) {
          mappings.push(mapping);
        }

        // Add to fill order if mappable
        if (mapping && mapping.confidence > 0.6) {
          fillOrder.push(element.id);
        }

        // Create validation checks
        const checks = this.createValidationChecks(element);
        validationChecks.push(...checks);
      }

      // Optimize fill order based on form flow
      const optimizedOrder = this.optimizeFillOrder(fillOrder, schema);

      const plan: FormFillPlan = {
        formId: schema.id,
        mappings,
        fillOrder: optimizedOrder,
        validationChecks,
        estimatedTime: this.estimateFillTime(mappings, schema)
      };

      console.log(`✅ [${planId}] Created plan with ${mappings.length} mappings`);
      return plan;

    } catch (error) {
      console.error(`❌ [${planId}] Failed to create mapping plan: ${error}`);
      throw error;
    }
  }

  /**
   * Execute form filling plan
   */
  async executeFormFillPlan(
    page: Page, 
    plan: FormFillPlan, 
    schema: FormSchema
  ): Promise<FormFillResult> {
    const executionId = randomUUID();
    const startTime = Date.now();

    console.log(`🚀 [${executionId}] Executing form fill plan`);

    const results: FieldFillResult[] = [];
    let successCount = 0;

    try {
      // Execute mappings in optimized order
      for (const elementId of plan.fillOrder) {
        const mapping = plan.mappings.find(m => m.elementId === elementId);
        const element = schema.elements.find(e => e.id === elementId);
        
        if (!mapping || !element) continue;

        try {
          const fieldResult = await this.fillFormElement(page, element, mapping);
          results.push(fieldResult);
          
          if (fieldResult.success) {
            successCount++;
          }

          // Add natural delay between fills
          await this.naturalDelay();

        } catch (fieldError) {
          console.error(`❌ Failed to fill field ${elementId}: ${fieldError}`);
          results.push({
            elementId,
            success: false,
            error: fieldError instanceof Error ? fieldError.message : String(fieldError)
          });
        }
      }

      // Run validation checks
      const validationResults = await this.runValidationChecks(page, plan.validationChecks);

      const executionTime = Date.now() - startTime;
      const successRate = (successCount / plan.mappings.length) * 100;

      const result: FormFillResult = {
        success: successRate > 70, // Consider successful if >70% fields filled
        executionTime,
        fieldsAttempted: plan.mappings.length,
        fieldsSuccessful: successCount,
        successRate,
        fieldResults: results,
        validationResults,
        errors: results.filter(r => !r.success).map(r => r.error).filter(Boolean) as string[]
      };

      console.log(`✅ [${executionId}] Form fill completed: ${successRate.toFixed(1)}% success`);
      return result;

    } catch (error) {
      return {
        success: false,
        executionTime: Date.now() - startTime,
        fieldsAttempted: plan.mappings.length,
        fieldsSuccessful: successCount,
        successRate: 0,
        fieldResults: results,
        validationResults: [],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // =============================================================================
  // FORM ELEMENT DISCOVERY
  // =============================================================================

  private async discoverFormElements(page: Page): Promise<FormElement[]> {
    console.log('🔍 Discovering form elements...');
    
    // Find all interactive form elements
    const elementSelectors = [
      'input',
      'textarea', 
      'select',
      'button[type="submit"]',
      'button:contains("submit")',
      'button:contains("apply")',
      'button:contains("next")',
      'button:contains("continue")'
    ];

    const elements: FormElement[] = [];

    for (const selector of elementSelectors) {
      try {
        const pageElements = await page.locator(selector).all();
        
        for (let i = 0; i < pageElements.length; i++) {
          const element = pageElements[i];
          const formElement = await this.analyzeFormElement(element, i);
          if (formElement) {
            elements.push(formElement);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error discovering ${selector} elements: ${error}`);
      }
    }

    console.log(`✅ Discovered ${elements.length} form elements`);
    return elements;
  }

  private async analyzeFormElement(element: any, index: number): Promise<FormElement | null> {
    try {
      const tagName = await element.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
      const attributes = await this.getElementAttributes(element);
      const labels = await this.getElementLabels(element);
      const position = await this.getElementPosition(element);
      const visibility = await this.getVisibilityInfo(element);

      const formElement: FormElement = {
        id: `element_${index}_${randomUUID().slice(0, 8)}`,
        type: this.determineElementType(tagName, attributes),
        tag: tagName,
        selector: await this.generateUniqueSelector(element),
        attributes,
        labels,
        placeholder: attributes.placeholder || '',
        value: attributes.value || '',
        required: attributes.required === 'true' || 'required' in attributes,
        validation: this.extractValidationRules(attributes),
        position,
        visibility,
        semanticMeaning: {
          fieldType: SemanticFieldType.UNKNOWN,
          confidence: 0,
          reasoning: [],
          alternatives: []
        }
      };

      return formElement;

    } catch (error) {
      console.warn(`⚠️ Error analyzing form element: ${error}`);
      return null;
    }
  }

  // =============================================================================
  // SEMANTIC ANALYSIS
  // =============================================================================

  private async applySemanticAnalysis(elements: FormElement[]): Promise<void> {
    console.log('🧠 Applying semantic analysis...');

    for (const element of elements) {
      element.semanticMeaning = await this.analyzeSemanticMeaning(element);
    }
  }

  private async analyzeSemanticMeaning(element: FormElement): Promise<SemanticMeaning> {
    const analysisKey = `${element.selector}_${element.attributes.name}_${element.labels.join('_')}`;
    
    // Check cache
    const cached = this.analysisCache.get(analysisKey);
    if (cached) {
      return cached;
    }

    const reasoning: string[] = [];
    const scores = new Map<SemanticFieldType, number>();

    // Analyze by attribute patterns
    this.analyzeByAttributes(element, scores, reasoning);

    // Analyze by label text
    this.analyzeByLabels(element, scores, reasoning);

    // Analyze by context (nearby elements)
    this.analyzeByContext(element, scores, reasoning);

    // Analyze by element properties
    this.analyzeByElementProperties(element, scores, reasoning);

    // Determine best match
    const sortedScores = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const topMatch = sortedScores[0];
    const alternatives = sortedScores.slice(1, 4).map(([type]) => type);

    const meaning: SemanticMeaning = {
      fieldType: topMatch ? topMatch[0] : SemanticFieldType.UNKNOWN,
      confidence: topMatch ? topMatch[1] : 0,
      reasoning,
      alternatives
    };

    // Cache the result
    this.analysisCache.set(analysisKey, meaning);

    return meaning;
  }

  private analyzeByAttributes(
    element: FormElement, 
    scores: Map<SemanticFieldType, number>, 
    reasoning: string[]
  ): void {
    const { name, id, type, autocomplete } = element.attributes;
    const searchText = `${name} ${id} ${autocomplete}`.toLowerCase();

    // Check patterns for each semantic type
    for (const [semanticType, patterns] of this.semanticPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(searchText)) {
          const currentScore = scores.get(semanticType) || 0;
          scores.set(semanticType, currentScore + 0.8);
          reasoning.push(`Attribute pattern match for ${semanticType}: ${pattern.source}`);
        }
      }
    }

    // Boost scores for input types
    if (type === 'email') {
      scores.set(SemanticFieldType.EMAIL, (scores.get(SemanticFieldType.EMAIL) || 0) + 1.0);
      reasoning.push('Input type is email');
    } else if (type === 'tel') {
      scores.set(SemanticFieldType.PHONE, (scores.get(SemanticFieldType.PHONE) || 0) + 1.0);
      reasoning.push('Input type is tel');
    } else if (type === 'file') {
      scores.set(SemanticFieldType.RESUME, (scores.get(SemanticFieldType.RESUME) || 0) + 0.8);
      reasoning.push('Input type is file (likely resume)');
    }
  }

  private analyzeByLabels(
    element: FormElement, 
    scores: Map<SemanticFieldType, number>, 
    reasoning: string[]
  ): void {
    const labelText = element.labels.join(' ').toLowerCase();
    
    for (const [semanticType, keywords] of this.contextualKeywords.entries()) {
      for (const keyword of keywords) {
        if (labelText.includes(keyword.toLowerCase())) {
          const currentScore = scores.get(semanticType) || 0;
          scores.set(semanticType, currentScore + 0.6);
          reasoning.push(`Label keyword match for ${semanticType}: "${keyword}"`);
        }
      }
    }
  }

  private analyzeByContext(
    element: FormElement, 
    scores: Map<SemanticFieldType, number>, 
    reasoning: string[]
  ): void {
    // Context analysis would look at nearby elements, section headings, etc.
    // For now, implementing basic placeholder detection
    const placeholder = element.placeholder.toLowerCase();
    
    if (placeholder.includes('first name')) {
      scores.set(SemanticFieldType.FIRST_NAME, (scores.get(SemanticFieldType.FIRST_NAME) || 0) + 0.9);
      reasoning.push('Placeholder indicates first name');
    } else if (placeholder.includes('last name')) {
      scores.set(SemanticFieldType.LAST_NAME, (scores.get(SemanticFieldType.LAST_NAME) || 0) + 0.9);
      reasoning.push('Placeholder indicates last name');
    }
  }

  private analyzeByElementProperties(
    element: FormElement, 
    scores: Map<SemanticFieldType, number>, 
    reasoning: string[]
  ): void {
    // Analyze based on validation rules, max length, etc.
    if (element.validation.some(rule => rule.type === 'pattern' && rule.value?.toString().includes('@'))) {
      scores.set(SemanticFieldType.EMAIL, (scores.get(SemanticFieldType.EMAIL) || 0) + 0.7);
      reasoning.push('Email pattern validation detected');
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private initializeSemanticPatterns(): void {
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
  }

  private async createElementMapping(
    element: FormElement, 
    userProfile: UserProfile
  ): Promise<DataMapping | null> {
    const semantic = element.semanticMeaning;
    if (semantic.confidence < 0.5) {
      return null; // Too uncertain to map
    }

    let userDataField: string;
    let value: any;

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
        return null; // Unsupported field type
    }

    if (!value) {
      return null; // No data available
    }

    return {
      elementId: element.id,
      userDataField,
      value,
      confidence: semantic.confidence,
      transformations: this.generateTransformations(element, value)
    };
  }

  private generateTransformations(element: FormElement, value: any): DataTransformation[] {
    const transformations: DataTransformation[] = [];

    // Add format transformations based on element type
    if (element.type === FormElementType.PHONE_INPUT && typeof value === 'string') {
      transformations.push({
        type: 'format',
        rule: 'phone-us-format'
      });
    }

    return transformations;
  }

  private async fillFormElement(
    page: Page, 
    element: FormElement, 
    mapping: DataMapping
  ): Promise<FieldFillResult> {
    try {
      const pageElement = page.locator(element.selector);
      
      // Apply transformations to value
      let value = mapping.value;
      for (const transformation of mapping.transformations) {
        value = this.applyTransformation(value, transformation);
      }

      // Fill based on element type
      switch (element.type) {
        case FormElementType.TEXT_INPUT:
        case FormElementType.EMAIL_INPUT:
        case FormElementType.PHONE_INPUT:
          await pageElement.fill(String(value));
          break;
          
        case FormElementType.FILE_UPLOAD:
          if (typeof value === 'string' && value.startsWith('/')) {
            await pageElement.setInputFiles(value);
          }
          break;
          
        case FormElementType.SELECT:
          await pageElement.selectOption(String(value));
          break;
          
        default:
          throw new Error(`Unsupported element type: ${element.type}`);
      }

      return {
        elementId: element.id,
        success: true
      };

    } catch (error) {
      return {
        elementId: element.id,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private applyTransformation(value: any, transformation: DataTransformation): any {
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
  }

  private formatPhoneNumber(phone: string): string {
    // Simple US phone formatting
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  private async naturalDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private determineElementType(tagName: string, attributes: Record<string, string>): FormElementType {
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
    } else if (tagName === 'textarea') {
      return FormElementType.TEXTAREA;
    } else if (tagName === 'select') {
      return FormElementType.SELECT;
    } else if (tagName === 'button') {
      return FormElementType.SUBMIT_BUTTON;
    }
    
    return FormElementType.UNKNOWN;
  }

  private async getElementAttributes(element: any): Promise<Record<string, string>> {
    return await element.evaluate((el: HTMLElement) => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    });
  }

  private async getElementLabels(element: any): Promise<string[]> {
    return await element.evaluate((el: HTMLElement) => {
      const labels: string[] = [];
      
      // Direct label association
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) {
          labels.push(label.textContent?.trim() || '');
        }
      }
      
      // Parent label
      const parentLabel = el.closest('label');
      if (parentLabel) {
        labels.push(parentLabel.textContent?.trim() || '');
      }
      
      // Nearby text (previous sibling, etc.)
      const prevSibling = el.previousElementSibling;
      if (prevSibling && prevSibling.textContent) {
        labels.push(prevSibling.textContent.trim());
      }
      
      return labels.filter(label => label.length > 0);
    });
  }

  private async getElementPosition(element: any): Promise<ElementPosition> {
    const box = await element.boundingBox();
    const isVisible = await element.isVisible();
    
    return {
      x: box?.x || 0,
      y: box?.y || 0,
      width: box?.width || 0,
      height: box?.height || 0,
      isVisible,
      zIndex: 0 // Would need additional logic to get z-index
    };
  }

  private async getVisibilityInfo(element: any): Promise<VisibilityInfo> {
    return await element.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return {
        visible: el.offsetParent !== null,
        hidden: el.hidden,
        display: style.display,
        opacity: parseFloat(style.opacity)
      };
    });
  }

  private async generateUniqueSelector(element: any): Promise<string> {
    return await element.evaluate((el: HTMLElement) => {
      // Generate a unique selector for this element
      if (el.id) {
        return `#${el.id}`;
      }
      
      if (el.name) {
        return `${el.tagName.toLowerCase()}[name="${el.name}"]`;
      }
      
      // Fallback to nth-child selector
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(el);
        return `${parent.tagName.toLowerCase()} > ${el.tagName.toLowerCase()}:nth-child(${index + 1})`;
      }
      
      return el.tagName.toLowerCase();
    });
  }

  private extractValidationRules(attributes: Record<string, string>): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
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
  }

  // Placeholder implementations for other methods
  private async identifyFormSections(elements: FormElement[], page: Page): Promise<FormSection[]> {
    return []; // Implementation would group elements into logical sections
  }

  private async analyzeFormFlow(page: Page): Promise<FormFlow> {
    return {
      steps: [],
      currentStep: 0,
      canNavigateBack: false,
      canNavigateForward: false
    };
  }

  private async analyzeValidation(page: Page): Promise<FormValidation> {
    return {
      clientSide: false,
      serverSide: false,
      realTimeValidation: false,
      validationSelectors: []
    };
  }

  private async extractMetadata(page: Page, elements: FormElement[]): Promise<FormMetadata> {
    return {
      company: 'Unknown',
      formType: 'application',
      estimatedFillTime: elements.length * 2000, // 2 seconds per field
      complexity: elements.length > 20 ? 'complex' : elements.length > 10 ? 'medium' : 'simple',
      language: 'en'
    };
  }

  private createValidationChecks(element: FormElement): ValidationCheck[] {
    return []; // Implementation would create validation checks
  }

  private optimizeFillOrder(fillOrder: string[], schema: FormSchema): string[] {
    return fillOrder; // Implementation would optimize based on form flow
  }

  private estimateFillTime(mappings: DataMapping[], schema: FormSchema): number {
    return mappings.length * 1500; // 1.5 seconds per field
  }

  private async runValidationChecks(page: Page, checks: ValidationCheck[]): Promise<ValidationResult[]> {
    return []; // Implementation would run validation checks
  }

  private generateCacheKey(url: string): string {
    return url.split('?')[0]; // Remove query parameters for caching
  }

  private isCacheValid(schema: FormSchema): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - schema.timestamp.getTime() < maxAge;
  }

  private loadCachedData(): void {
    // Load cached patterns and mappings
  }
}

// =============================================================================
// ADDITIONAL INTERFACES
// =============================================================================

export interface FieldFillResult {
  elementId: string;
  success: boolean;
  error?: string;
}

export interface FormFillResult {
  success: boolean;
  executionTime: number;
  fieldsAttempted: number;
  fieldsSuccessful: number;
  successRate: number;
  fieldResults: FieldFillResult[];
  validationResults: ValidationResult[];
  errors: string[];
}

export interface ValidationResult {
  checkId: string;
  passed: boolean;
  message?: string;
}