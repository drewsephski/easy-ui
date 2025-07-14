import React from 'react';
import { BentoGridEditor } from '@/components/visual-editors/BentoGridEditor';
import { TransactionEditor } from '@/components/visual-editors/TransactionEditor';
import { ComponentPropConfig } from '@/types/template-builder';

const defaultFontFamilies = [
  { name: "Signature", value: '"Dancing Script", cursive' },
  { name: "Classic", value: '"Great Vibes", cursive' },
  { name: "Modern", value: '"Alex Brush", cursive' },
];

const defaultSignatureStyles = [
  { name: "No Underline", value: "none" },
  { name: "Simple Underline", value: "simple" },
  { name: "Wave Underline", value: "wave" },
];

const defaultColors = [
  "#000000",
  "#0000FF",
  "#006400",
  "#8B0000",
  "#4B0082",
  "#ffffff",
];

type ComponentPropsMap = {
  [key: string]: Record<string, ComponentPropConfig>;
};

export const componentProps: ComponentPropsMap = {
  AnimatedBadge: {
    text: { type: 'string', default: 'Animated Badge', tooltip: 'The text content of the badge.', label: 'Text' },
    bgColor: { type: 'string', default: 'bg-green-900', tooltip: 'The background color of the badge.', label: 'Background Color' },
    textColor: { type: 'string', default: 'text-green-300', tooltip: 'The text color of the badge.', label: 'Text Color' },
    gradientColor: { type: 'string', default: 'from-transparent via-emerald-600 to-transparent', tooltip: 'The gradient color for the animation.', label: 'Gradient Color' },
    animationDuration: { type: 'string', default: '4s', tooltip: 'The duration of the spin animation.', label: 'Animation Duration' },
    size: {
      type: 'select',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' }
      ],
      default: 'md',
      tooltip: 'The size of the badge.',
      label: 'Size'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  AnimatedBeam: {
    duration: { type: 'number', default: 3, tooltip: 'The duration of the beam animation.', label: 'Duration' },
    delay: { type: 'number', default: 0, tooltip: 'The delay before the beam animation starts.', label: 'Delay' },
    reverse: { type: 'boolean', default: false, tooltip: 'Whether to reverse the beam animation.', label: 'Reverse' },
    curvature: { type: 'number', default: 0, tooltip: 'The curvature of the beam.', label: 'Curvature' },
    pathColor: { type: 'color', default: 'gray', tooltip: 'The color of the beam path.', label: 'Path Color' },
    pathWidth: { type: 'number', default: 2, tooltip: 'The width of the beam path.', label: 'Path Width' },
    pathOpacity: { type: 'number', default: 0.2, tooltip: 'The opacity of the beam path.', label: 'Path Opacity', min: 0, max: 1, step: 0.1 },
    gradientStartColor: { type: 'color', default: '#4d40ff', tooltip: 'The start color of the beam gradient.', label: 'Gradient Start' },
    gradientStopColor: { type: 'color', default: '#4043ff', tooltip: 'The stop color of the beam gradient.', label: 'Gradient End' },
    startXOffset: { type: 'number', default: 0, tooltip: 'The starting X offset of the beam.', label: 'Start X Offset' },
    startYOffset: { type: 'number', default: 0, tooltip: 'The starting Y offset of the beam.', label: 'Start Y Offset' },
    endXOffset: { type: 'number', default: 0, tooltip: 'The ending X offset of the beam.', label: 'End X Offset' },
    endYOffset: { type: 'number', default: 0, tooltip: 'The ending Y offset of the beam.', label: 'End Y Offset' },
    dotted: { type: 'boolean', default: false, tooltip: 'Whether the beam path is dotted.', label: 'Dotted' },
    dotSpacing: { type: 'number', default: 6, tooltip: 'The spacing between dots in the beam path.', label: 'Dot Spacing', displayCondition: (props) => props.dotted },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  BeamButton: {
    children: { type: 'string', default: 'Beam Button', tooltip: 'The text content of the button.', label: 'Text' },
    beamColor: { type: 'color', default: '#3b82f6', tooltip: 'The color of the animated beam.', label: 'Beam Color' },
    glowColor: { type: 'color', default: 'rgba(59, 130, 246, 0.5)', tooltip: 'The color of the glow effect on hover.', label: 'Glow Color' },
    hoverColor: { type: 'color', default: 'rgba(59, 130, 246, 0.2)', tooltip: 'The background color on hover.', label: 'Hover Color' },
    variant: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' }
      ],
      default: 'default',
      tooltip: 'The visual style of the button.',
      label: 'Variant'
    },
    borderColor: {
      type: 'color',
      default: '#3b82f6',
      tooltip: 'The border color of the button (only for outline variant).',
      label: 'Border Color',
      displayCondition: (props) => props.variant === 'outline',
    },
    size: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
        { label: 'Icon', value: 'icon' }
      ],
      default: 'default',
      tooltip: 'The size of the button.',
      label: 'Size'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  BeamCard: {
    children: { type: 'string', default: 'Beam Card Content', tooltip: 'The content of the card.', label: 'Content' },
    beamColor: { type: 'color', default: '#3b82f6', tooltip: 'The color of the animated beam.', label: 'Beam Color' },
    glowColor: { type: 'color', default: 'rgba(59, 130, 246, 0.5)', tooltip: 'The color of the glow effect on hover.', label: 'Glow Color' },
    borderColor: { type: 'string', default: 'bg-gray-300 dark:bg-gray-700', tooltip: 'The border color of the card.', label: 'Border Color' },
    hoverColor: { type: 'color', default: 'rgba(59, 130, 246, 0.2)', tooltip: 'The background color on hover.', label: 'Hover Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  ColoredButton: {
    children: { type: 'string', default: 'Colored Button', tooltip: 'The text content of the button.', label: 'Text' },
    rainbowIntensity: { type: 'number', default: 1, tooltip: 'The intensity of the rainbow effect on hover.', label: 'Rainbow Intensity', min: 0, max: 10, step: 0.1 },
    rainbowDuration: { type: 'number', default: 3, tooltip: 'The duration of the rainbow animation cycle.', label: 'Rainbow Duration', min: 1, max: 10, step: 0.5 },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  ConfettiPoll: {
    votes: { type: 'number', default: 0 },
    options: { type: 'array', default: ['Option A', 'Option B'] },
    className: { type: 'string', default: '' },
  },
  CreateNew: {
    actions: {
      type: 'array',
      default: [
        { link: '#', icon: 'Plus', name: 'New Item' }
      ],
      tooltip: 'The actions available in the "Create New" menu.'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.' },
  },
  FeatureCard: {
    title: { type: 'string', default: 'Social', tooltip: 'The title of the feature card.', label: 'Title' },
    description: { type: 'string', default: 'Write once, share with your friends', tooltip: 'The description of the feature card.', label: 'Description' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  FileUploadCard: {
    zones: {
      type: 'array',
      default: [
        { title: 'Upload Images', subtitle: 'Drop images here', icon: 'Image', gradient: 'from-purple-400 via-pink-500 to-red-500', rotate: '-rotate-2' },
        { title: 'Upload Videos', subtitle: 'Drop videos here', icon: 'Video', gradient: 'from-blue-400 via-teal-500 to-green-500', rotate: '' },
        { title: 'Upload Files', subtitle: 'Drop files here', icon: 'UploadCloudIcon', gradient: 'from-yellow-400 via-orange-500 to-red-500', rotate: 'rotate-3' },
      ],
      tooltip: 'The upload zones to display.'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.' },
  },
  FireflyButton: {
    text: { type: 'string', default: 'Firefly Button', tooltip: 'The text content of the button.', label: 'Text' },
    backgroundColor: { type: 'color', default: '#FFEB3B', tooltip: 'The background color of the button.', label: 'Background Color' },
    textColor: { type: 'color', default: '#000000', tooltip: 'The text color of the button.', label: 'Text Color' },
    glowColor: { type: 'color', default: '#FDFCA9', tooltip: 'The color of the glow and fireflies.', label: 'Glow Color' },
    fireflyCount: { type: 'number', default: 7, tooltip: 'The number of fireflies.', label: 'Firefly Count', min: 1, max: 20, step: 1 },
    fontSize: { type: 'string', default: '1rem', tooltip: 'The font size of the button text.', label: 'Font Size' },
    padding: { type: 'string', default: '1rem 2rem', tooltip: 'The padding of the button.', label: 'Padding' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  GlitchText: {
    text: { type: 'string', default: 'Glitch Text', tooltip: 'The text to apply the glitch effect to.', label: 'Text' },
    textSize: { type: 'string', default: '4rem', tooltip: 'The font size of the text.', label: 'Text Size' },
    fontWeight: {
      type: 'select',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Bold', value: 'bold' },
        { label: 'Lighter', value: 'lighter' },
      ],
      default: 'normal',
      tooltip: 'The font weight of the text.',
      label: 'Font Weight'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  HexagonHero: {
    title: { type: 'string', default: 'Hexagons', tooltip: 'The main title text.', label: 'Title' },
    gradientColor: { type: 'color', default: '#ff8811', tooltip: 'The color of the radial gradient.', label: 'Gradient Color' },
    hexagonColor: { type: 'color', default: '#131217', tooltip: 'The color of the hexagons.', label: 'Hexagon Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  Highlighter: {
    children: { type: 'string', default: 'Highlight This Text', tooltip: 'The text to be highlighted.', label: 'Text' },
    action: {
      type: 'select',
      options: [
        { label: 'Highlight', value: 'highlight' },
        { label: 'Circle', value: 'circle' },
      ],
      default: 'highlight',
      tooltip: 'The type of annotation to apply.',
      label: 'Action'
    },
    color: { type: 'color', default: '#ffd1dc', tooltip: 'The color of the annotation.', label: 'Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  HoverButton: {
    children: { type: 'string', default: 'Hover Button', tooltip: 'The text content of the button.', label: 'Text' },
    href: { type: 'string', default: '', tooltip: 'The URL the button links to.', label: 'Link URL' },
    variant: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ],
      default: 'default',
      tooltip: 'The visual style of the button.',
      label: 'Variant'
    },
    size: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
        { label: 'Icon', value: 'icon' },
      ],
      default: 'default',
      tooltip: 'The size of the button.',
      label: 'Size'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  IdeaForm: {
    maxChars: { type: 'number', default: 500, tooltip: 'The maximum number of characters for the idea.', label: 'Max Characters' },
    placeholders: { type: 'array', default: ["What's on your mind?", "Any bright ideas?"], tooltip: 'A list of placeholders to cycle through.', label: 'Placeholders' },
    backgroundColor: { type: 'string', default: 'bg-black dark:bg-white', tooltip: 'The background color of the form.', label: 'Background Color' },
    textColor: { type: 'string', default: 'text-white dark:text-black', tooltip: 'The text color of the form.', label: 'Text Color' },
    accentColor: { type: 'string', default: 'bg-yellow-400', tooltip: 'The accent color of the form.', label: 'Accent Color' },
    submitDelay: { type: 'number', default: 1000, tooltip: 'The delay in milliseconds before the form resets after submission.', label: 'Submit Delay' },
    buttonText: { type: 'string', default: 'Share your thoughts', tooltip: 'The text on the button to open the form.', label: 'Button Text' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  KeyButton: {
    text: { type: 'string', default: 'Key Button', tooltip: 'The text content of the button.', label: 'Text' },
    size: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
        { label: 'Icon', value: 'icon' },
      ],
      default: 'default',
      tooltip: 'The size of the button.',
      label: 'Size'
    },
    variant: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ],
      default: 'default',
      tooltip: 'The visual style of the button.',
      label: 'Variant'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  Launchpad: {
    title: { type: 'string', default: 'Launchpad' },
    description: { type: 'string', default: 'Quick access to your apps.' },
    className: { type: 'string', default: '' },
  },
  LogoParticles: {
    text: { type: 'string', default: 'Easy UI', tooltip: 'The text to render as particles.', label: 'Text' },
    fontSize: { type: 'number', default: 80, tooltip: 'The font size of the text.', label: 'Font Size', min: 10, max: 200, step: 1 },
    primaryColor: { type: 'color', default: 'white', tooltip: 'The primary color of the particles.', label: 'Primary Color' },
    scatteredColor: { type: 'color', default: '#00DCFF', tooltip: 'The color of the particles when scattered.', label: 'Scattered Color' },
    backgroundColor: { type: 'color', default: 'black', tooltip: 'The background color of the canvas.', label: 'Background Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  PixelCard: {
    cards: {
      type: 'array',
      default: [
        { icon: "M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V98H38V56A2,2,0,0,1,40,54ZM38,200V110H98v92H40A2,2,0,0,1,38,200Zm178,2H110V110H218v90A2,2,0,0,1,216,202Z", label: "Layout", color: "#e0f2fe" },
        { icon: "M67.84,92.61,25.37,128l42.47,35.39a6,6,0,1,1-7.68,9.22l-48-40a6,6,0,0,1,0-9.22l48-40a6,6,0,0,1,7.68,9.22Zm176,30.78-48-40a6,6,0,1,0-7.68,9.22L230.63,128l-42.47,35.39a6,6,0,1,0,7.68,9.22l48-40a6,6,0,0,0,0-9.22Zm-81.79-89A6,6,0,0,0,154.36,38l-64,176A6,6,0,0,0,94,221.64a6.15,6.15,0,0,0,2,.36,6,6,0,0,0,5.64-3.95l64-176A6,6,0,0,0,162.05,34.36Z", label: "Code", color: "#e0f2fe", canvasProps: { gap: 10, speed: 25, colors: "#e0f2fe, #7dd3fc, #0ea5e9" } },
        { icon: "M180,146H158V110h22a34,34,0,1,0-34-34V98H110V76a34,34,0,1,0-34,34H98v36H76a34,34,0,1,0,34,34V158h36v22a34,34,0,1,0,34-34ZM158,76a22,22,0,1,1,22,22H158ZM54,76a22,22,0,0,1,44,0V98H76A22,22,0,0,1,54,76ZM98,180a22,22,0,1,1-22-22H98Zm12-70h36v36H110Zm70,92a22,22,0,0,1-22-22V158h22a22,22,0,0,1,0,44Z", label: "Command", color: "#fef08a", canvasProps: { gap: 3, speed: 20, colors: "#fef08a, #fde047, #eab308" } },
        { icon: "M222,67.34a33.81,33.81,0,0,0-10.64-24.25C198.12,30.56,176.68,31,163.54,44.18L142.82,65l-.63-.63a22,22,0,0,0-31.11,0l-9,9a14,14,0,0,0,0,19.81l3.47,3.47L53.14,149.1a37.81,37.81,0,0,0-9.84,36.73l-8.31,19a11.68,11.68,0,0,0,2.46,13A13.91,13.91,0,0,0,47.32,222,14.15,14.15,0,0,0,53,220.82L71,212.92a37.92,37.92,0,0,0,35.84-10.07l52.44-52.46,3.47,3.48a14,14,0,0,0,19.8,0l9-9a22.06,22.06,0,0,0,0-31.13l-.66-.65L212,91.85A33.76,33.76,0,0,0,222,67.34Zm-123.61,127a26,26,0,0,1-26,6.47,6,6,0,0,0-4.17.24l-20,8.75a2,2,0,0,1-2.09-.31l9.12-20.9a5.94,5.94,0,0,0,.19-4.31A25.91,25.91,0,0,1,56,166h70.78ZM138.78,154H65.24l48.83-48.84,36.76,36.78Zm64.77-70.59L178.17,108.9a6,6,0,0,0,0,8.47l4.88,4.89a10,10,0,0,1,0,14.15l-9,9a2,2,0,0,1-2.82,0l-60.69-60.7a2,2,0,0,1,0-2.83l9-9a10,10,0,0,1,14.14,0l4.89,4.89a6,6,0,0,0,4.24,1.75h0a6,6,0,0,0,4.25-1.77L172,52.66c8.57-8.58,22.51-9,31.07-.85a22,22,0,0,1,.44,31.57Z", label: "Dropper", color: "#fecdd3", canvasProps: { gap: 6, speed: 80, colors: "#fecdd3, #fda4af, #e11d48", noFocus: true } }
      ],
      tooltip: 'The configuration for the pixel cards.'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.' },
  },
  ReactionBar: {
    reactions: {
      type: 'array',
      default: [
        { id: 'like', emoji: '👍', label: 'Like', color: '#3b82f6' },
        { id: 'love', emoji: '❤️', label: 'Love', color: '#ef4444' },
        { id: 'laugh', emoji: '😂', label: 'Laugh', color: '#f97316' },
        { id: 'wow', emoji: '😮', label: 'Wow', color: '#facc15' },
        { id: 'sad', emoji: '😢', label: 'Sad', color: '#6b7280' },
      ],
      tooltip: 'The available reactions.',
      label: 'Reactions'
    },
    defaultReaction: {
      type: 'string',
      default: JSON.stringify({ id: 'like', emoji: '👍', label: 'Like', color: '#3b82f6' }),
      tooltip: 'The default reaction when none is selected.',
      label: 'Default Reaction'
    },
    popoverPosition: {
      type: 'select',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
      ],
      default: 'top',
      tooltip: 'The position of the reaction popover.',
      label: 'Popover Position'
    },
    showLabel: { type: 'boolean', default: false, tooltip: 'Whether to show the reaction label next to the emoji.', label: 'Show Label' },
    imageSize: { type: 'number', default: 20, tooltip: 'The size of the default image.', label: 'Image Size' },
    emojiSize: { type: 'number', default: 16, tooltip: 'The size of the emoji.', label: 'Emoji Size' },
    popoverClassName: { type: 'string', default: '', tooltip: 'Additional CSS classes for the popover.', label: 'Popover CSS' },
    defaultImage: { type: 'string', default: '', tooltip: 'The URL of the default image to display.', label: 'Default Image URL' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  SearchCommand: {
    tagsData: {
      type: 'array',
      default: [
        { tag: 'React', url: 'https://react.dev/' },
        { tag: 'Next.js', url: 'https://nextjs.org/' },
        { tag: 'SvelteKit', url: 'https://kit.svelte.dev/' },
        { tag: 'Vue.js', url: 'https://vuejs.org/' },
        { tag: 'Angular', url: 'https://angular.io/' },
      ],
      tooltip: 'The data for the tags to be displayed in the search command.',
      label: 'Tags Data'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  SignatureAnimation: {
    initialName: { type: 'string', default: '', tooltip: 'The initial name for the signature.', label: 'Initial Name' },
    fontFamilies: { type: 'array', default: defaultFontFamilies, tooltip: 'The available font families.', label: 'Font Families' },
    signatureStyles: { type: 'array', default: defaultSignatureStyles, tooltip: 'The available signature styles.', label: 'Signature Styles' },
    colors: { type: 'array', default: defaultColors, tooltip: 'The available colors.', label: 'Colors' },
    initialFontFamily: { type: 'string', default: defaultFontFamilies[0].value, tooltip: 'The initial font family.', label: 'Initial Font' },
    initialSignatureStyle: { type: 'string', default: defaultSignatureStyles[0].value, tooltip: 'The initial signature style.', label: 'Initial Style' },
    initialColor: { type: 'color', default: defaultColors[1], tooltip: 'The initial color of the signature.', label: 'Initial Color' },
    initialSize: { type: 'number', default: 48, tooltip: 'The initial size of the signature font.', label: 'Initial Size' },
    minSize: { type: 'number', default: 24, tooltip: 'The minimum size of the signature font.', label: 'Min Size' },
    maxSize: { type: 'number', default: 72, tooltip: 'The maximum size of the signature font.', label: 'Max Size' },
    placeholder: { type: 'string', default: 'Enter your name', tooltip: 'The placeholder text for the input field.', label: 'Placeholder' },
    signButtonText: { type: 'string', default: 'SIGN', tooltip: 'The text on the sign button.', label: 'Sign Button Text' },
    copiedText: { type: 'string', default: 'Copied!', tooltip: 'The text displayed when the signature is copied.', label: 'Copied Text' },
    copyText: { type: 'string', default: 'Copy Signature', tooltip: 'The text on the copy button.', label: 'Copy Text' },
    signedByText: { type: 'string', default: 'SIGNED BY,', tooltip: 'The text displayed above the signature.', label: 'Signed By Text' },
    showControls: { type: 'boolean', default: true, tooltip: 'Whether to show the signature controls.', label: 'Show Controls' },
    showColorPalette: { type: 'boolean', default: true, tooltip: 'Whether to show the color palette.', label: 'Show Color Palette', displayCondition: (props) => props.showControls },
    showFontSelector: { type: 'boolean', default: true, tooltip: 'Whether to show the font selector.', label: 'Show Font Selector', displayCondition: (props) => props.showControls },
    showStyleSelector: { type: 'boolean', default: true, tooltip: 'Whether to show the style selector.', label: 'Show Style Selector', displayCondition: (props) => props.showControls },
    showSizeSlider: { type: 'boolean', default: true, tooltip: 'Whether to show the size slider.', label: 'Show Size Slider', displayCondition: (props) => props.showControls },
    animationDuration: { type: 'number', default: 2000, tooltip: 'The duration of the signing animation.', label: 'Animation Duration' },
    undoLimit: { type: 'number', default: 10, tooltip: 'The number of undo steps to store.', label: 'Undo Limit' },
    backgroundColor: { type: 'color', default: 'transparent', tooltip: 'The background color of the component.', label: 'Background Color' },
    signButtonColor: { type: 'color', default: 'black', tooltip: 'The background color of the sign button.', label: 'Sign Button Color' },
    signButtonTextColor: { type: 'color', default: 'white', tooltip: 'The text color of the sign button.', label: 'Sign Button Text Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  SparkleButton: {
    text: { type: 'string', default: 'Sparkle Button', tooltip: 'The text content of the button.', label: 'Text' },
    href: { type: 'string', default: '', tooltip: 'The URL the button links to.', label: 'Link URL' },
    size: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
        { label: 'Icon', value: 'icon' },
      ],
      default: 'default',
      tooltip: 'The size of the button.',
      label: 'Size'
    },
    variant: {
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ],
      default: 'default',
      tooltip: 'The visual style of the button.',
      label: 'Variant'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  TiltMotion: {
    children: { type: 'string', default: 'Tilt Motion Card', tooltip: 'The content to apply the tilt effect to.', label: 'Content' },
    tiltFactor: { type: 'number', default: 15, tooltip: 'The factor by which to tilt the component.', label: 'Tilt Factor', min: 0, max: 50, step: 1 },
    perspective: { type: 'number', default: 1000, tooltip: 'The perspective value for the 3D effect.', label: 'Perspective' },
    scale: { type: 'number', default: 1.05, tooltip: 'The scale factor on hover.', label: 'Scale', min: 1, max: 2, step: 0.01 },
    transitionDuration: { type: 'number', default: 0.5, tooltip: 'The duration of the tilt animation.', label: 'Transition Duration', min: 0, max: 2, step: 0.1 },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  TransactionList: {
    transactions: {
      type: 'array',
      default: [],
      label: 'Transactions',
      render: ({ value, onChange }) => {
        return React.createElement(TransactionEditor, { value, onChange });
      },
    },
    className: { type: 'string', default: '', label: 'Custom CSS' },
  },

  // MagicUI Components
  AnimatedBeamMultipleOutputs: {
    duration: { type: 'number', default: 3, label: 'Duration' },
    className: { type: 'string', default: '', label: 'Custom CSS' },
  },
  AnimatedGradientText: {
    text: { type: 'string', default: 'Animated Gradient Text', tooltip: 'The text to apply the gradient animation to.', label: 'Text' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  AnimatedShinyText: {
    text: { type: 'string', default: 'Animated Shiny Text', tooltip: 'The text to apply the shiny animation to.', label: 'Text' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  AnimatedSubscribeButton: {
    buttonTextColor: { type: 'color', default: '', tooltip: 'The color of the button text.', label: 'Button Text Color' },
    subscribeStatus: { type: 'boolean', default: false, tooltip: 'The initial subscription status.', label: 'Subscribed' },
    initialText: { type: 'string', default: 'Subscribe', tooltip: 'The initial text of the button.', label: 'Initial Text' },
    changeText: { type: 'string', default: 'Subscribed', tooltip: 'The text of the button after subscribing.', label: 'Subscribed Text' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  AvatarCircles: {
    numPeople: { type: 'number', default: 3, label: 'Number of People' },
    className: { type: 'string', default: '', label: 'Custom CSS' },
  },
  BentoGrid: {
    cards: {
      type: 'array',
      default: [
        { name: 'Card 1', className: 'col-span-1', background: '<div>Card 1</div>', Icon: 'div', description: 'Description 1', href: '#', cta: 'Learn More' },
        { name: 'Card 2', className: 'col-span-1', background: '<div>Card 2</div>', Icon: 'div', description: 'Description 2', href: '#', cta: 'Learn More' },
        { name: 'Card 3', className: 'col-span-1', background: '<div>Card 3</div>', Icon: 'div', description: 'Description 3', href: '#', cta: 'Learn More' },
      ],
      tooltip: 'The configuration for the cards in the bento grid.',
      label: 'Cards',
      render: ({ value, onChange }) => {
        return React.createElement(BentoGridEditor, { value, onChange });
      },
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  BorderBeam: {
    size: { type: 'number', default: 200, tooltip: 'The size of the beam.', label: 'Size' },
    duration: { type: 'number', default: 15, tooltip: 'The duration of the beam animation.', label: 'Duration' },
    anchor: { type: 'number', default: 90, tooltip: 'The anchor point of the beam.', label: 'Anchor' },
    borderWidth: { type: 'number', default: 1.5, tooltip: 'The width of the border.', label: 'Border Width' },
    colorFrom: { type: 'color', default: '#ffaa40', tooltip: 'The starting color of the beam.', label: 'Color From' },
    colorTo: { type: 'color', default: '#9c40ff', tooltip: 'The ending color of the beam.', label: 'Color To' },
    delay: { type: 'number', default: 0, tooltip: 'The delay before the beam animation starts.', label: 'Delay' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  LinearGradient: {
    from: { type: 'color', default: '#00000000', tooltip: 'The starting color of the gradient.', label: 'From' },
    to: { type: 'color', default: 'rgba(120,119,198,0.3)', tooltip: 'The ending color of the gradient.', label: 'To' },
    width: { type: 'string', default: '100%', tooltip: 'The width of the gradient.', label: 'Width' },
    height: { type: 'string', default: '100%', tooltip: 'The height of the gradient.', label: 'Height' },
    direction: {
      type: 'select',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
        { label: 'Top Left', value: 'top left' },
        { label: 'Top Right', value: 'top right' },
        { label: 'Bottom Left', value: 'bottom left' },
        { label: 'Bottom Right', value: 'bottom right' },
      ],
      default: 'bottom',
      tooltip: 'The direction of the gradient.',
      label: 'Direction'
    },
    transitionPoint: { type: 'string', default: '50%', tooltip: 'The point at which the transition occurs.', label: 'Transition Point' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  MagicCard: {
    children: { type: 'string', default: 'Magic Card Content', tooltip: 'The content of the card.', label: 'Content' },
    size: { type: 'number', default: 600, tooltip: 'The size of the spotlight effect in pixels.', label: 'Spotlight Size' },
    spotlight: { type: 'boolean', default: true, tooltip: 'Whether to show the spotlight.', label: 'Show Spotlight' },
    spotlightColor: { type: 'color', default: 'rgba(255,255,255,0.03)', tooltip: 'The color of the spotlight.', label: 'Spotlight Color', displayCondition: (props) => props.spotlight },
    isolated: { type: 'boolean', default: true, tooltip: 'Whether to isolate the card which is being hovered.', label: 'Isolated' },
    background: { type: 'string', default: 'rgba(255,255,255,0.03)', tooltip: 'The background of the card.', label: 'Background' },
    borderColor: { type: 'color', default: 'hsl(0 0% 98%)', tooltip: 'The border color of the card.', label: 'Border Color' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  Marquee: {
    children: { type: 'string', default: 'Marquee Text', tooltip: 'The content to be displayed in the marquee.', label: 'Content' },
    reverse: { type: 'boolean', default: false, tooltip: 'Whether to reverse the direction of the marquee.', label: 'Reverse' },
    pauseOnHover: { type: 'boolean', default: false, tooltip: 'Whether to pause the marquee on hover.', label: 'Pause on Hover' },
    vertical: { type: 'boolean', default: false, tooltip: 'Whether the marquee should scroll vertically.', label: 'Vertical' },
    repeat: { type: 'number', default: 4, tooltip: 'The number of times to repeat the content.', label: 'Repeat' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  OrbitingCircles: {
    radius: { type: 'number', default: 50, tooltip: 'The radius of the orbiting circle.', label: 'Radius' },
    duration: { type: 'number', default: 20, tooltip: 'The duration of the orbit animation.', label: 'Duration' },
    delay: { type: 'number', default: 10, tooltip: 'The delay before the orbit animation starts.', label: 'Delay' },
    reverse: { type: 'boolean', default: false, tooltip: 'Whether to reverse the direction of the orbit.', label: 'Reverse' },
    path: { type: 'boolean', default: true, tooltip: 'Whether to show the orbit path.', label: 'Show Path' },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
  SparklesText: {
    text: { type: 'string', default: 'Sparkles Text', tooltip: 'The text to apply the sparkles effect to.', label: 'Text' },
    sparklesCount: { type: 'number', default: 10, tooltip: 'The number of sparkles.', label: 'Sparkle Count' },
    colors: {
      type: 'string',
      default: JSON.stringify({ first: '#A07CFE', second: '#FE8FB5' }),
      tooltip: 'The colors of the sparkles.',
      label: 'Sparkle Colors'
    },
    className: { type: 'string', default: '', tooltip: 'Additional CSS classes for customization.', label: 'Custom CSS' },
  },
};
