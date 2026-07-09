import { getContent } from './src/getContent.js';

export default {
    editor: {
        label: { en: 'Stepper' },
        icon: 'menu',
    },
    triggerEvents: [
        {
            name: 'stepChange',
            label: { en: 'On step change' },
            event: { stepIndex: 0 },
            default: true,
        },
        {
            name: 'stepComplete',
            label: { en: 'On step complete' },
            event: { stepIndex: 0 },
        },
        { name: 'finish', label: { en: 'On finish' }, event: { totalSteps: 0 } },
    ],
    actions: [
        {
            action: 'goToStep',
            label: { en: 'Go to step' },
            args: [{ name: 'index', type: 'number', label: { en: 'Step index' } }],
        },
        { action: 'goToNextStep', label: { en: 'Next step' } },
        { action: 'goToPreviousStep', label: { en: 'Previous step' } },
        { action: 'triggerFinish', label: { en: 'Trigger finish' } },
        /* wwEditor:start */
        { action: 'addStep', label: { en: 'Add step' } },
        {
            action: 'removeStep',
            label: { en: 'Remove step' },
            args: [{ name: 'index', type: 'number', label: { en: 'Step index' } }],
        },
        {
            action: 'moveStepUp',
            label: { en: 'Move step up' },
            args: [{ name: 'index', type: 'number', label: { en: 'Step index' } }],
        },
        {
            action: 'moveStepDown',
            label: { en: 'Move step down' },
            args: [{ name: 'index', type: 'number', label: { en: 'Step index' } }],
        },
        {
            action: 'updateStepLabel',
            label: { en: 'Update step label' },
            args: [
                {
                    name: 'payload',
                    type: 'object',
                    label: { en: 'Step data' },
                    options: {
                        item: {
                            index: { type: 'number', label: { en: 'Step index' } },
                            label: { type: 'string', label: { en: 'New label' } },
                        },
                    },
                },
            ],
        },
        /* wwEditor:end */
    ],
    properties: {
        stepsContent: {
            label: { en: 'Steps' },
            bindable: 'repeatable',
            type: 'Info',
            options: { text: ' ' },
            section: 'settings',
            defaultValue: [
                { isWwObject: true, type: 'ww-flexbox' },
                { isWwObject: true, type: 'ww-flexbox' },
            ],
            navigator: { group: 'Steps' },
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'array' }, { type: 'object' }],
                tooltip: 'A collection or an array of data: \n\n`myCollection` or `[{}, {}, ...]`',
            },
            propertyHelp: {
                tooltip:
                    'The steps of the stepper. Each entry is a droppable content area shown when its step is active.',
            },
            /* wwEditor:end */
        },
        stepIndex: {
            label: { en: 'Steps' },
            type: 'Tabs',
            editorOnly: true,
            options: (content, _, boundProps) => {
                const isBound = !!boundProps.stepsContent;
                const _content = getContent(content.stepsContent);
                return {
                    labels: _content.map((_, index) => ({
                        label: content.stepLabels?.[index] || `Step ${index + 1}`,
                        customizable: true,
                    })),
                    prefixLabel: 'Step',
                    nbTabs: _content.length,
                    add: 'addStep',
                    remove: 'removeStep',
                    orderable: true,
                    moveUp: 'moveStepUp',
                    moveDown: 'moveStepDown',
                    updateLabel: 'updateStepLabel',
                    fixed: isBound,
                };
            },
            section: 'settings',
            defaultValue: 0,
        },
        orientation: {
            label: { en: 'Orientation' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'horizontal', default: true, label: { en: 'Horizontal' } },
                    { value: 'vertical', label: { en: 'Vertical' } },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: 'horizontal',
            section: 'settings',
            /* wwEditor:start */
            propertyHelp: {
                tooltip: 'Layout direction of the step indicators: horizontal or vertical.',
            },
            /* wwEditor:end */
        },
        indicatorsPosition: {
            label: { en: 'Steps position' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'left', default: true, label: { en: 'Left' } },
                    { value: 'right', label: { en: 'Right' } },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: 'left',
            section: 'settings',
            hidden: content => content.orientation !== 'vertical',
            /* wwEditor:start */
            propertyHelp: {
                tooltip:
                    'Side of the step indicators relative to the step content. Only relevant for the vertical orientation.',
            },
            /* wwEditor:end */
        },
        clickableSteps: {
            label: { en: 'Clickable steps' },
            type: 'OnOff',
            defaultValue: false,
            bindable: true,
            section: 'settings',
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Whether users can click a step indicator to navigate.\n\nBoolean (either true or false)',
            },
            propertyHelp: {
                tooltip:
                    'Allow users to jump to a step by clicking its indicator. Limited to the current, previous or already completed steps — never skips ahead past unvalidated steps.',
            },
            /* wwEditor:end */
        },
        showLabels: {
            label: { en: 'Show labels' },
            type: 'OnOff',
            defaultValue: true,
            section: 'settings',
            /* wwEditor:start */
            propertyHelp: {
                tooltip: 'Show a text label next to each step indicator.',
            },
            /* wwEditor:end */
        },
        showNavButtons: {
            label: { en: 'Show navigation buttons' },
            type: 'OnOff',
            defaultValue: false,
            section: 'settings',
            /* wwEditor:start */
            propertyHelp: {
                tooltip:
                    'Show built-in previous/next buttons below the step content. Hidden by default: when each step contains a form, drive the navigation from the form buttons and its submit workflow instead.',
            },
            /* wwEditor:end */
        },
        navigationButtons: {
            hidden: true,
            defaultValue: [
                { isWwObject: true, type: 'ww-button' },
                { isWwObject: true, type: 'ww-button' },
            ],
        },
        stepLabels: {
            hidden: true,
            defaultValue: [],
        },
        stepStyle: {
            label: { en: 'Step style' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'numbers', default: true, label: { en: 'Numbers' } },
                    { value: 'bullets', label: { en: 'Bullets' } },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: 'numbers',
            section: 'style',
            /* wwEditor:start */
            propertyHelp: {
                tooltip: 'Visual style of the step indicators: numbers (numbered circles) or bullets (small dots).',
            },
            /* wwEditor:end */
        },
        currentColor: {
            label: { en: 'Current step color' },
            type: 'Color',
            options: { nullable: true },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: '#2563eb',
            section: 'style',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A color code: `"#2563eb"`',
            },
            propertyHelp: {
                tooltip: 'Background color of the current step indicator.',
            },
            /* wwEditor:end */
        },
        activeColor: {
            label: { en: 'Completed step color' },
            type: 'Color',
            options: { nullable: true },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: '#2563eb',
            section: 'style',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A color code: `"#2563eb"`',
            },
            propertyHelp: {
                tooltip: 'Background color of completed step indicators and their connectors.',
            },
            /* wwEditor:end */
        },
        inactiveColor: {
            label: { en: 'Inactive step color' },
            type: 'Color',
            options: { nullable: true },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: '#d1d5db',
            section: 'style',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A color code: `"#d1d5db"`',
            },
            propertyHelp: {
                tooltip: 'Background color of steps that have not been reached yet.',
            },
            /* wwEditor:end */
        },
        iconColor: {
            label: { en: 'Icon color' },
            type: 'Color',
            options: { nullable: true },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            defaultValue: '#ffffff',
            section: 'style',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A color code: `"#ffffff"`',
            },
            propertyHelp: {
                tooltip: 'Color of the number or icon rendered inside a step indicator.',
            },
            /* wwEditor:end */
        },
        completedIcon: {
            label: { en: 'Completed step icon' },
            type: 'SystemIcon',
            defaultValue: '',
            section: 'style',
            /* wwEditor:start */
            propertyHelp: {
                tooltip: 'Icon shown inside a completed step. Falls back to a checkmark when empty.',
            },
            /* wwEditor:end */
        },
        numberFontSize: {
            label: { en: 'Number font size' },
            type: 'Length',
            options: { unitChoices: [{ value: 'px', label: 'px', min: 8, max: 64 }] },
            responsive: true,
            states: true,
            bindable: true,
            defaultValue: '14px',
            section: 'style',
            hidden: content => content.stepStyle === 'bullets',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'font-size',
                type: 'string',
                tooltip: 'A CSS length: `"14px"`',
            },
            propertyHelp: {
                tooltip: 'Font size of the step number. Only relevant for the Numbers style.',
            },
            /* wwEditor:end */
        },
        labelTypography: {
            label: { en: 'Labels typography' },
            type: 'Typography',
            section: 'style',
            bindable: true,
            responsive: true,
            states: true,
            classes: true,
            isStyle: true,
            options: (content, sidepanelContent, boundProperties) => ({
                initialValue: {
                    fontSize: '13px',
                    fontFamily: undefined,
                    fontWeight: 400,
                    fontStyle: undefined,
                    lineHeight: undefined,
                },
                creationDisabled: !!boundProperties.labelTypography,
                creationDisabledMessage: 'Cannot create typography from a bound property',
            }),
            hidden: content => !content.showLabels,
            /* wwEditor:start */
            propertyHelp: {
                tooltip:
                    'Typography of the step labels (font size, family, weight, style, line height). Only relevant when labels are shown.',
            },
            /* wwEditor:end */
        },
    },
};
