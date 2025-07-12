import { ComponentPropConfig } from '@/types/template-builder';

type ComponentPropsMap = {
  [key: string]: Record<string, ComponentPropConfig>;
};

export const componentProps: ComponentPropsMap = {
  AnimatedBadge: {
    children: { type: 'string', default: 'Animated Badge' },
    className: { type: 'string', default: '' },
    variant: { 
      type: 'select', 
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' }
      ], 
      default: 'default' 
    },
  },
  AnimatedBeam: {
    duration: { type: 'number', default: 3 },
    reverse: { type: 'boolean', default: false },
    className: { type: 'string', default: '' },
  },
  BeamButton: {
    children: { type: 'string', default: 'Beam Button' },
    beamColor: { type: 'color', default: '#3b82f6' },
    glowColor: { type: 'color', default: 'rgba(59, 130, 246, 0.5)' },
    hoverColor: { type: 'color', default: 'rgba(59, 130, 246, 0.2)' },
    className: { type: 'string', default: '' },
    variant: { 
      type: 'select', 
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' }
      ], 
      default: 'default' 
    },
  },
  BeamCard: {
    children: { type: 'string', default: 'Beam Card Content' },
    className: { type: 'string', default: '' },
  },
  ColoredButton: {
    children: { type: 'string', default: 'Colored Button' },
    color: { type: 'color', default: '#FF0000' },
    className: { type: 'string', default: '' },
  },
  ConfettiPoll: {
    votes: { type: 'number', default: 0 },
    options: { type: 'array', default: ['Option A', 'Option B'] },
    className: { type: 'string', default: '' },
  },
  CreateNew: {
    title: { type: 'string', default: 'Create New Item' },
    description: { type: 'string', default: 'Start building something new.' },
    buttonText: { type: 'string', default: 'Create' },
    className: { type: 'string', default: '' },
  },
  FeatureCard: {
    title: { type: 'string', default: 'Social' },
    description: { type: 'string', default: 'Write once, share with your friends' },
    icon: { type: 'string', default: 'User' }, // Assuming icon names as strings
    className: { type: 'string', default: '' },
  },
  FileUploadCard: {
    title: { type: 'string', default: 'Upload Your Files' },
    description: { type: 'string', default: 'Drag and drop or click to upload.' },
    className: { type: 'string', default: '' },
  },
  FireflyButton: {
    children: { type: 'string', default: 'Firefly Button' },
    className: { type: 'string', default: '' },
  },
  GlitchText: {
    children: { type: 'string', default: 'Glitch Text' },
    className: { type: 'string', default: '' },
  },
  HexagonHero: {
    title: { type: 'string', default: 'Hexagon Hero' },
    description: { type: 'string', default: 'A modern hero section.' },
    className: { type: 'string', default: '' },
  },
  Highlighter: {
    children: { type: 'string', default: 'Highlight This Text' },
    color: { type: 'color', default: '#FFFF00' },
    className: { type: 'string', default: '' },
  },
  HoverButton: {
    children: { type: 'string', default: 'Hover Button' },
    className: { type: 'string', default: '' },
  },
  IdeaForm: {
    title: { type: 'string', default: 'Submit Your Idea' },
    placeholder: { type: 'string', default: 'Enter your idea here...' },
    buttonText: { type: 'string', default: 'Submit' },
    className: { type: 'string', default: '' },
  },
  KeyButton: {
    children: { type: 'string', default: 'Key Button' },
    className: { type: 'string', default: '' },
  },
  Launchpad: {
    title: { type: 'string', default: 'Launchpad' },
    description: { type: 'string', default: 'Quick access to your apps.' },
    className: { type: 'string', default: '' },
  },
  LogoParticles: {
    logoText: { type: 'string', default: 'LOGO' },
    className: { type: 'string', default: '' },
  },
  PixelCard: {
    title: { type: 'string', default: 'Pixel Card' },
    description: { type: 'string', default: 'Retro pixel art style card.' },
    className: { type: 'string', default: '' },
  },
  ReactionBar: {
    likes: { type: 'number', default: 0 },
    dislikes: { type: 'number', default: 0 },
    className: { type: 'string', default: '' },
  },
  SearchCommand: {
    placeholder: { type: 'string', default: 'Type a command or search...' },
    className: { type: 'string', default: '' },
  },
  SignatureAnimation: {
    text: { type: 'string', default: 'Your Signature' },
    className: { type: 'string', default: '' },
  },
  SparkleButton: {
    children: { type: 'string', default: 'Sparkle Button' },
    className: { type: 'string', default: '' },
  },
  TiltMotion: {
    children: { type: 'string', default: 'Tilt Motion Card' },
    className: { type: 'string', default: '' },
  },
  TransactionList: {
    transactions: { type: 'array', default: [] }, // This will need a custom editor
    className: { type: 'string', default: '' },
  },

  // MagicUI Components
  AnimatedBeamMultipleOutputs: {
    duration: { type: 'number', default: 3 },
    className: { type: 'string', default: '' },
  },
  AnimatedGradientText: {
    children: { type: 'string', default: 'Animated Gradient Text' },
    fromColor: { type: 'color', default: '#ff0000' },
    toColor: { type: 'color', default: '#00ff00' },
    className: { type: 'string', default: '' },
  },
  AnimatedShinyText: {
    children: { type: 'string', default: 'Animated Shiny Text' },
    className: { type: 'string', default: '' },
  },
  AnimatedSubscribeButton: {
    buttonText: { type: 'string', default: 'Subscribe' },
    className: { type: 'string', default: '' },
  },
  AvatarCircles: {
    numPeople: { type: 'number', default: 3 },
    className: { type: 'string', default: '' },
  },
  BentoGrid: {
    className: { type: 'string', default: '' },
  },
  BorderBeam: {
    size: { type: 'number', default: 200 },
    duration: { type: 'number', default: 5 },
    className: { type: 'string', default: '' },
  },
  LinearGradient: {
    children: { type: 'string', default: 'Linear Gradient' },
    from: { type: 'color', default: '#FF0000' },
    to: { type: 'color', default: '#0000FF' },
    className: { type: 'string', default: '' },
  },
  MagicCard: {
    children: { type: 'string', default: 'Magic Card Content' },
    className: { type: 'string', default: '' },
  },
  Marquee: {
    children: { type: 'string', default: 'Marquee Text' },
    direction: { 
      type: 'select', 
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' }
      ], 
      default: 'left' 
    },
    className: { type: 'string', default: '' },
  },
  OrbitingCircles: {
    radius: { type: 'number', default: 20 },
    duration: { type: 'number', default: 20 },
    reverse: { type: 'boolean', default: false },
    className: { type: 'string', default: '' },
  },
  SparklesText: {
    children: { type: 'string', default: 'Sparkles Text' },
    className: { type: 'string', default: '' },
  },
};
