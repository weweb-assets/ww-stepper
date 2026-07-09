<template>
    <div
        class="ww-stepper"
        :class="[orientation, `style-${stepStyle}`, `indicators-${indicatorsPosition}`, { editing: isEditing }]"
        :style="cssVariables"
    >
        <div class="ww-stepper__layout">
            <div class="ww-stepper__header" role="list">
                <template v-for="index in nbOfSteps" :key="index">
                    <div
                        class="ww-stepper__step"
                        :class="stepStates[index - 1]"
                        role="listitem"
                        :aria-current="stepStates[index - 1] === 'current' ? 'step' : undefined"
                    >
                        <div
                            class="ww-stepper__indicator"
                            :class="{ clickable: canClickStep(index - 1) }"
                            :role="canClickStep(index - 1) ? 'button' : undefined"
                            :tabindex="canClickStep(index - 1) ? 0 : undefined"
                            @click="onStepClick(index - 1)"
                            @keydown.enter.prevent="onStepClick(index - 1)"
                            @keydown.space.prevent="onStepClick(index - 1)"
                        >
                            <template v-if="stepStyle !== 'bullets'">
                                <svg
                                    v-if="stepStates[index - 1] === 'completed' && !completedIconHTML"
                                    class="ww-stepper__check"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M20 6L9 17l-5-5"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                                <span
                                    v-else-if="stepStates[index - 1] === 'completed'"
                                    class="ww-stepper__check"
                                    aria-hidden="true"
                                    v-html="completedIconHTML"
                                ></span>
                                <span v-else class="ww-stepper__number">{{ index }}</span>
                            </template>
                        </div>
                        <div
                            v-if="content.showLabels"
                            class="ww-stepper__label"
                            :class="{ 'with-font': !!content.labelTypography }"
                        >
                            {{ stepLabels[index - 1] || `Step ${index}` }}
                        </div>
                    </div>
                    <div
                        v-if="index < nbOfSteps"
                        class="ww-stepper__connector"
                        :class="index <= activeStepIndex ? 'completed' : 'inactive'"
                    ></div>
                </template>
            </div>

            <div class="ww-stepper__body">
                <div class="ww-stepper__content">
                    <wwLayout :disable-drag-drop="true" path="stepsContent" class="ww-stepper__panels">
                        <template #default="{ item, index }">
                            <wwLayoutItem v-show="index === activeStepIndex" class="ww-stepper__panel">
                                <wwElement v-if="item !== undefined" v-bind="item" />
                            </wwLayoutItem>
                        </template>
                    </wwLayout>
                </div>

                <div v-if="content.showNavButtons && content.navigationButtons?.length" class="ww-stepper__nav">
                    <div
                        class="ww-stepper__nav-prev"
                        :class="{ disabled: isFirstStep && !isEditing }"
                        @click="onPreviousClick"
                    >
                        <wwElement v-bind="content.navigationButtons[0]" />
                    </div>
                    <div class="ww-stepper__nav-next" @click="onNextClick">
                        <wwElement v-bind="content.navigationButtons[1]" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { getContent } from './getContent.js';

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content', 'update:sidepanel-content', 'trigger-event'],
    setup(props, { emit }) {
        /* wwEditor:start */
        const { createElement, cloneElement } = wwLib.useCreateElement();
        /* wwEditor:end */

        const activeStepIndex = ref(0);
        const completedSteps = ref([]);

        const isEditing = computed(() => {
            /* wwEditor:start */
            return props.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        });

        const steps = computed(() => getContent(props.content.stepsContent));
        const nbOfSteps = computed(() => steps.value.length);
        const orientation = computed(() => props.content.orientation || 'horizontal');
        const indicatorsPosition = computed(() => props.content.indicatorsPosition || 'left');
        const stepStyle = computed(() => props.content.stepStyle || 'numbers');
        const stepLabels = computed(() => props.content.stepLabels || []);
        const isFirstStep = computed(() => activeStepIndex.value <= 0);
        const isLastStep = computed(() => activeStepIndex.value >= nbOfSteps.value - 1);
        const canClickStep = index =>
            isEditing.value ||
            (!!props.content.clickableSteps &&
                (index <= activeStepIndex.value || completedSteps.value.includes(index)));

        const stepStates = computed(() =>
            Array.from({ length: nbOfSteps.value }, (_, index) => {
                if (index === activeStepIndex.value) return 'current';
                if (index < activeStepIndex.value || completedSteps.value.includes(index)) return 'completed';
                return 'inactive';
            })
        );

        const cssVariables = computed(() => ({
            '--stepper-current': props.content.currentColor,
            '--stepper-completed': props.content.activeColor,
            '--stepper-inactive': props.content.inactiveColor,
            '--stepper-icon': props.content.iconColor,
            '--stepper-number-size': props.content.numberFontSize,
            '--stepper-label-font': props.content.labelTypography,
        }));

        const { getIcon } = wwLib.useIcons();
        const completedIconHTML = ref('');
        watch(
            () => props.content.completedIcon,
            async icon => {
                completedIconHTML.value = icon ? await getIcon(icon) : '';
            },
            { immediate: true }
        );

        const markCompleted = index => {
            if (index >= 0 && !completedSteps.value.includes(index)) {
                completedSteps.value = [...completedSteps.value, index];
            }
        };

        const goToStep = index => {
            if (typeof index !== 'number' || index < 0 || index >= nbOfSteps.value) return;
            if (index === activeStepIndex.value) return;
            activeStepIndex.value = index;
            emit('trigger-event', {
                name: 'stepChange',
                event: { stepIndex: index },
            });
        };

        const goToNextStep = () => {
            if (isLastStep.value) return;
            const from = activeStepIndex.value;
            markCompleted(from);
            emit('trigger-event', {
                name: 'stepComplete',
                event: { stepIndex: from },
            });
            goToStep(from + 1);
        };

        const goToPreviousStep = () => {
            if (isFirstStep.value) return;
            goToStep(activeStepIndex.value - 1);
        };

        const triggerFinish = () => {
            markCompleted(activeStepIndex.value);
            emit('trigger-event', {
                name: 'finish',
                event: { totalSteps: nbOfSteps.value },
            });
        };

        const onNextClick = () => {
            if (isEditing.value) return;
            if (isLastStep.value) triggerFinish();
            else goToNextStep();
        };

        const onPreviousClick = () => {
            if (isEditing.value) return;
            goToPreviousStep();
        };

        const onStepClick = index => {
            /* wwEditor:start */
            if (isEditing.value) {
                activeStepIndex.value = index;
                return;
            }
            /* wwEditor:end */
            if (!canClickStep(index)) return;
            goToStep(index);
        };

        watch(nbOfSteps, count => {
            if (activeStepIndex.value > count - 1) {
                activeStepIndex.value = Math.max(0, count - 1);
            }
        });

        /* wwEditor:start */
        watch(
            () => props.wwEditorState.sidepanelContent.stepIndex,
            index => {
                if (!isEditing.value) return;
                if (typeof index === 'number' && activeStepIndex.value !== index) {
                    activeStepIndex.value = index;
                }
            }
        );

        watch(activeStepIndex, index => {
            if (!isEditing.value) return;
            if (props.wwEditorState.sidepanelContent.stepIndex !== index) {
                emit('update:sidepanel-content', { path: 'stepIndex', value: index });
            }
        });

        const buildLabels = base => {
            const labels = [...(base || [])];
            const stepsContent = [...(props.content.stepsContent || [])];
            while (labels.length < stepsContent.length) {
                labels.push(`Step ${labels.length + 1}`);
            }
            return labels;
        };

        const addStep = async () => {
            const stepsContent = [...(props.content.stepsContent || [])];
            const stepLabelsValue = buildLabels(props.content.stepLabels);
            if (stepsContent.length === 0) {
                const step = await createElement('ww-flexbox');
                stepsContent.push(step);
                stepLabelsValue.push('Step 1');
            } else {
                const { uid } = await cloneElement(stepsContent[stepsContent.length - 1].uid);
                stepsContent.push(uid);
                stepLabelsValue.push(`Step ${stepsContent.length}`);
            }
            emit('update:content', { stepsContent, stepLabels: stepLabelsValue });
        };

        const removeStep = index => {
            const stepsContent = [...(props.content.stepsContent || [])];
            const stepLabelsValue = [...(props.content.stepLabels || [])];
            stepsContent.splice(index, 1);
            if (stepLabelsValue.length > index) stepLabelsValue.splice(index, 1);
            emit('update:content', { stepsContent, stepLabels: stepLabelsValue });
        };

        const moveStep = (index, offset) => {
            const target = index + offset;
            const stepsContent = [...(props.content.stepsContent || [])];
            if (target < 0 || target >= stepsContent.length) return;
            const stepLabelsValue = buildLabels(props.content.stepLabels);
            [stepsContent[index], stepsContent[target]] = [stepsContent[target], stepsContent[index]];
            [stepLabelsValue[index], stepLabelsValue[target]] = [stepLabelsValue[target], stepLabelsValue[index]];
            emit('update:content', { stepsContent, stepLabels: stepLabelsValue });
        };

        const moveStepUp = index => moveStep(index, -1);
        const moveStepDown = index => moveStep(index, 1);

        const updateStepLabel = ({ index, label }) => {
            const stepLabelsValue = [...(props.content.stepLabels || [])];
            while (stepLabelsValue.length <= index) stepLabelsValue.push(null);
            stepLabelsValue[index] = label;
            emit('update:content', { stepLabels: stepLabelsValue });
        };
        /* wwEditor:end */

        const registerVariable = (name, source, type) => {
            const variable = wwLib.wwVariable.useComponentVariable({
                uid: props.uid,
                name,
                defaultValue: typeof source.value === 'undefined' ? source : source.value,
                type,
                readonly: true,
            });
            watch(source, value => variable.setValue(value), { deep: true });
            return variable;
        };

        registerVariable('activeStepIndex', activeStepIndex, 'number');
        registerVariable('completedSteps', completedSteps, 'any');
        registerVariable('isFirstStep', isFirstStep, 'boolean');
        registerVariable('isLastStep', isLastStep, 'boolean');

        wwLib.wwElement.useRegisterElementLocalContext(
            'stepper',
            { activeStepIndex, nbOfSteps, isFirstStep, isLastStep, completedSteps },
            {
                goToStep: {
                    method: goToStep,
                    editor: {
                        label: 'Go to step',
                        elementName: 'Stepper',
                        description: 'Go to a specific step index.',
                        args: [{ name: 'Index', type: 'number' }],
                    },
                },
                goToNextStep: {
                    method: goToNextStep,
                    editor: {
                        label: 'Next step',
                        elementName: 'Stepper',
                        description: 'Go to the next step.',
                    },
                },
                goToPreviousStep: {
                    method: goToPreviousStep,
                    editor: {
                        label: 'Previous step',
                        elementName: 'Stepper',
                        description: 'Go to the previous step.',
                    },
                },
                triggerFinish: {
                    method: triggerFinish,
                    editor: {
                        label: 'Trigger finish',
                        elementName: 'Stepper',
                        description: 'Trigger the finish event.',
                    },
                },
            }
        );

        return {
            activeStepIndex,
            isEditing,
            nbOfSteps,
            orientation,
            indicatorsPosition,
            stepStyle,
            stepLabels,
            stepStates,
            cssVariables,
            isFirstStep,
            isLastStep,
            canClickStep,
            completedIconHTML,
            onStepClick,
            onNextClick,
            onPreviousClick,
            goToStep,
            goToNextStep,
            goToPreviousStep,
            triggerFinish,
            /* wwEditor:start */
            addStep,
            removeStep,
            moveStepUp,
            moveStepDown,
            updateStepLabel,
            /* wwEditor:end */
        };
    },
};
</script>

<style lang="scss" scoped>
.ww-stepper {
    display: flex;
    flex-direction: column;
    gap: 24px;

    &__layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-width: 0;
    }
    &.vertical &__layout {
        flex-direction: row;
        align-items: flex-start;
    }
    &.vertical.indicators-right &__layout {
        flex-direction: row-reverse;
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1 1 auto;
        min-width: 0;
    }

    &__header {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }
    &.vertical &__header {
        flex-direction: column;
        align-items: stretch;
    }

    &__step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
    }
    &.vertical &__step {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
    }
    &.vertical.indicators-right &__step {
        flex-direction: row-reverse;
    }

    &__indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--stepper-inactive, #d1d5db);
        color: var(--stepper-icon, #ffffff);
        font-size: var(--stepper-number-size, 14px);
        font-weight: 600;
        flex: 0 0 auto;
        transition: background-color 0.2s ease;

        &.clickable {
            cursor: pointer;
        }
    }
    &__step.current &__indicator {
        background: var(--stepper-current, #2563eb);
    }
    &__step.completed &__indicator {
        background: var(--stepper-completed, #2563eb);
    }

    &.style-bullets &__indicator {
        width: 14px;
        height: 14px;
    }

    &__check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60%;
        height: 60%;
        color: var(--stepper-icon, #ffffff);

        :deep(svg) {
            width: 100%;
            height: 100%;
        }
    }

    &__number {
        line-height: 1;
    }

    &__label {
        font-size: 13px;
        color: inherit;
        opacity: 0.55;
        text-align: center;
        white-space: nowrap;

        &.with-font {
            font: var(--stepper-label-font);
        }
    }
    &__step.current &__label {
        opacity: 1;
        font-weight: 600;
    }
    &__step.completed &__label {
        opacity: 1;
    }

    &__connector {
        flex: 1 1 auto;
        height: 2px;
        min-width: 24px;
        margin: 15px 8px 0;
        background: var(--stepper-inactive, #d1d5db);
        transition: background-color 0.2s ease;
    }
    &.style-bullets &__connector {
        margin-top: 6px;
    }
    &.vertical &__connector {
        width: 2px;
        height: auto;
        min-height: 24px;
        min-width: 0;
        margin: 8px 0 8px 15px;
        align-self: stretch;
        flex: 0 0 24px;
    }
    &.vertical.indicators-right &__connector {
        margin: 8px 15px 8px auto;
    }
    &.vertical.style-bullets &__connector {
        margin: 8px 0 8px 6px;
    }
    &.vertical.style-bullets.indicators-right &__connector {
        margin: 8px 6px 8px auto;
    }
    &__connector.completed {
        background: var(--stepper-completed, #2563eb);
    }

    &__content {
        flex: 1 1 auto;
        min-width: 0;
    }

    &__panel {
        width: 100%;
    }

    &__nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 12px;
    }
    &__nav-prev.disabled {
        opacity: 0.4;
        pointer-events: none;
    }
}
</style>
