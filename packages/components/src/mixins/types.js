/**
 * @import {IdMixin} from './global/id.js'
 * @import {FlexMixin} from './styles/flex.js'
 * @import {TextMixin} from './styles/text.js'
 * @import {HeadingMixin} from './styles/heading.js'
 * @import {SpacingDirection, SpacingMargin, SpacingPadding, SpacingMixin} from './styles/spacing.js'
 * @import {ShadowMixin} from './styles/shadow.js'
 * @import {RoundedMixin} from './styles/rounded.js'
 * @import {ZIndexMixin} from './styles/z-index.js'
 * @import {TransformTranslateMixin} from './styles/transform-translate.js'
 * @import {PositionMixin} from './styles/position.js'
 * @import {OverflowMixin} from './styles/overflow.js'
 * @import {InsetMixin} from './styles/inset.js'
 * @import {GapMixin} from './styles/gap.js'
 * @import {FormControlMixin} from './styles/form-control.js'
 * @import {DisplayMixin} from './styles/display.js'
 * @import {FontMixin} from './styles/font.js'
 * @import {ContainerMixin} from './styles/container.js'
 * @import {ButtonMixin} from './styles/button.js'
 * @import {ColorMixin} from './styles/color.js'
 * @import {BorderMixin} from './styles/border.js'
 * @import {BackgroundMixin} from './styles/background.js'
 * @import {InputTextMixin} from './input/input-text.js'
 * @import {InputNumberMixin} from './input/input-number.js'
 * @import {InputFileMixin} from './input/input-file.js'
 * @import {InputDirMixin} from './input/input-dir.js'
 * @import {InputCheckboxMixin} from './input/input-checkbox.js'
 * @import {InputAllMixin} from './input/input-all.js'
 * @import {ContenteditableMixin} from './global/contentable.js'
 * @import {NameMixin} from './global/name.js'
 * @import {TabIndexMixin} from './global/tabindex.js'
 * @import {TranslateMixin} from './global/translate.js'
 * @import {JustifyContentMixin, AlignContentMixin, AlignItemsMixin, FlexSizeMixin, FlexOrderMixin} from './styles/flex.js'
 * @import {EventTypeAnimationMixin} from './event-type/event-type-animation.js'
 * @import {EventTypeClipboardMixin} from './event-type/event-type-clipboard.js'
 * @import {EventTypeCompositionMixin} from './event-type/event-type-composition.js'
 * @import {EventTypeElementCancelMixin} from './event-type/event-type-element-cancel.js'
 * @import {EventTypeElementChangeMixin} from './event-type/event-type-element-change.js'
 * @import {EventTypeElementDragDropMixin} from './event-type/event-type-element-drag-drop.js'
 * @import {EventTypeElementMixin} from './event-type/event-type-element.js'
 * @import {EventTypeFocusMixin} from './event-type/event-type-focus.js'
 * @import {EventTypeFullscreenMixin} from './event-type/event-type-fullscreen.js'
 * @import {EventTypeKeyboardMixin} from './event-type/event-type-keyboard.js'
 * @import {EventTypeMouseMixin} from './event-type/event-type-mouse.js'
 * @import {EventTypeScrollMixin} from './event-type/event-type-scroll.js'
 * @import {EventTypeSelectMixin} from './event-type/event-type-select.js'
 * @import {EventTypeTouchMixin} from './event-type/event-type-touch.js'
 * @import {EventTypeTransitionMixin} from './event-type/event-type-transition.js'
 * @import {RoleTablistMixin} from './aria-role/tablist.js'
 * @import {AriaControlsMixin} from './aria/aria-controls.js'
 * @import {AriaCurrentMixin} from './aria/aria-current.js'
 * @import {AriaDisabledMixin} from './aria/aria-disabled.js'
 * @import {AriaExpandedMixin} from './aria/aria-expanded.js'
 * @import {AriaLabelMixin} from './aria/aria-label.js'
 * @import {AriaSelectedMixin} from './aria/aria-selected.js'
 * @import {FocusRingMixin} from './styles/focus-ring.js'
 * @import {TextColorMixin} from './styles/text-color.js'
 * @import {TextOpacityMixin} from './styles/text-opacity.js'
 * @import {FloatMixin} from './styles/float.js'
 * @import {SizingMixin} from './styles/sizing.js'
 * @import {TableHeaderMixin} from './table/table-header.js'
 * @import {TableCellMixin} from './table/table-cell.js'
 * @import {TableColMixin} from './table/table-col.js'
 * @import {DimensionMixin} from './global/dimension.js'
 * @import {MediaMixin} from './global/media.js'
 * @import {EventTypeDetailsMixin} from './event-type/event-type-details.js'
 * @import {EventTypeDialogMixin} from './event-type/event-type-dialog.js'
 * @import {EventTypeMediaMixin} from './event-type/event-type-media.js'
 */

/**
 * @typedef {EventTypeMediaMixin} EventTypeMediaMixin
 * @typedef {EventTypeDialogMixin} EventTypeDialogMixin
 * @typedef {EventTypeDetailsMixin} EventTypeDetailsMixin
 * @typedef {MediaMixin} MediaMixin
 * @typedef {DimensionMixin} DimensionMixin
 * @typedef {TextOpacityMixin} TextOpacityMixin
 * @typedef {TextColorMixin} TextColorMixin
 * @typedef {FocusRingMixin} FocusRingMixin
 * @typedef {IdMixin} IdMixin
 * @typedef {FlexMixin} FlexMixin
 * @typedef {AriaControlsMixin} AriaControlsMixin
 * @typedef {AriaCurrentMixin} AriaCurrentMixin
 * @typedef {AriaDisabledMixin} AriaDisabledMixin
 * @typedef {AriaExpandedMixin} AriaExpandedMixin
 * @typedef {AriaSelectedMixin} AriaSelectedMixin
 * @typedef {RoleTablistMixin} RoleTablistMixin
 * @typedef {EventTypeAnimationMixin} EventTypeAnimationMixin
 * @typedef {EventTypeClipboardMixin} EventTypeClipboardMixin
 * @typedef {EventTypeCompositionMixin} EventTypeCompositionMixin
 * @typedef {EventTypeElementCancelMixin} EventTypeElementCancelMixin
 * @typedef {EventTypeElementChangeMixin} EventTypeElementChangeMixin
 * @typedef {EventTypeElementDragDropMixin} EventTypeElementDragDropMixin
 * @typedef {EventTypeElementMixin} EventTypeElementMixin
 * @typedef {EventTypeFocusMixin} EventTypeFocusMixin
 * @typedef {EventTypeFullscreenMixin} EventTypeFullscreenMixin
 * @typedef {EventTypeKeyboardMixin} EventTypeKeyboardMixin
 * @typedef {EventTypeScrollMixin} EventTypeScrollMixin
 * @typedef {EventTypeSelectMixin} EventTypeSelectMixin
 * @typedef {EventTypeTouchMixin} EventTypeTouchMixin
 * @typedef {EventTypeTransitionMixin} EventTypeTransitionMixin
 * @typedef {TextMixin} TextMixin
 * @typedef {HeadingMixin} HeadingMixin
 * @typedef {SpacingDirection} SpacingDirection
 * @typedef {SpacingMargin} SpacingMargin
 * @typedef {SpacingPadding} SpacingPadding
 * @typedef {SpacingMixin} SpacingMixin
 * @typedef {ShadowMixin} ShadowMixin
 * @typedef {RoundedMixin} RoundedMixin
 * @typedef {TransformTranslateMixin} TransformTranslateMixin
 * @typedef {ZIndexMixin} ZIndexMixin
 * @typedef {PositionMixin} PositionMixin
 * @typedef {OverflowMixin} OverflowMixin
 * @typedef {InsetMixin} InsetMixin
 * @typedef {GapMixin} GapMixin
 * @typedef {FormControlMixin} FormControlMixin
 * @typedef {FontMixin} FontMixin
 * @typedef {JustifyContentMixin} JustifyContentMixin
 * @typedef {AlignContentMixin} AlignContentMixin
 * @typedef {AlignItemsMixin} AlignItemsMixin
 * @typedef {FlexSizeMixin} FlexSizeMixin
 * @typedef {FlexOrderMixin} FlexOrderMixin
 * @typedef {DisplayMixin} DisplayMixin
 * @typedef {ContainerMixin} ContainerMixin
 * @typedef {ColorMixin} ColorMixin
 * @typedef {ButtonMixin} ButtonMixin
 * @typedef {BorderMixin} BorderMixin
 * @typedef {BackgroundMixin} BackgroundMixin
 * @typedef {InputTextMixin} InputTextMixin
 * @typedef {InputNumberMixin} InputNumberMixin
 * @typedef {InputFileMixin} InputFileMixin
 * @typedef {InputDirMixin} InputDirMixin
 * @typedef {InputCheckboxMixin} InputCheckboxMixin
 * @typedef {InputAllMixin} InputAllMixin
 * @typedef {ContenteditableMixin} ContenteditableMixin
 * @typedef {NameMixin} NameMixin
 * @typedef {TabIndexMixin} TabIndexMixin
 * @typedef {AriaLabelMixin} AriaLabelMixin
 * @typedef {EventTypeMouseMixin} EventTypeMouseMixin
 * @typedef {TranslateMixin} TranslateMixin
 * @typedef {FloatMixin} FloatMixin
 * @typedef {SizingMixin} SizingMixin
 * @typedef {TableHeaderMixin} TableHeaderMixin
 * @typedef {TableCellMixin} TableCellMixin
 * @typedef {TableColMixin} TableColMixin
 */

export {}