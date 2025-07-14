import {
  ComponentIcon,
} from 'lucide-react';
import { z } from 'zod';

import AnimatedBadge from '@/components/easyui/animated-badge';
import { AnimatedBeamDemo as AnimatedBeam } from '@/components/easyui/animated-beam';
import { BeamButton } from '@/components/easyui/beam-button';
import { BeamCard } from '@/components/easyui/beam-card';
import { ColoredButton } from '@/components/easyui/colored-button';
import CreateNew from '@/components/easyui/create-new';
import FeatureCard from '@/components/easyui/feature-card';
import FileUploadCard from '@/components/easyui/file-upload-card';
import FireflyButton from '@/components/easyui/firefly-button';
import GlitchText from '@/components/easyui/glitch-text';
import HexagonHero from '@/components/easyui/hexagon-hero';
import Highlighter from '@/components/easyui/highlighter';
import { HoverButton } from '@/components/easyui/hover-button';
import IdeaForm from '@/components/easyui/idea-form';
import KeyButton from '@/components/easyui/key-button';
import LogoParticles from '@/components/easyui/logo-particles';
import PixelCard from '@/components/easyui/pixel-card';
import { ReactionBar } from '@/components/easyui/reaction-bar';
import SearchCommand from '@/components/easyui/search-command';
import { AdvancedSignatureCreatorComponent as SignatureAnimation } from '@/components/easyui/signature-animation';
import SparkleButton from '@/components/easyui/sparkle-button';
import { TiltMotion } from '@/components/easyui/tilt-motion';
import { AnimatedBeamMultipleOutputDemo as AnimatedBeamMultipleOutputs } from '@/components/magicui/animated-beam-multiple-outputs';
import AnimatedGradientText from '@/components/magicui/animated-gradient-text';
import AnimatedShinyText from '@/components/magicui/animated-shiny-text';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { BentoGrid } from '@/components/magicui/bento-grid';
import { BorderBeamm as BorderBeam } from '@/components/magicui/border-beam';
import LinearGradient from '@/components/magicui/linear-gradient';
import { MagicCard } from '@/components/magicui/magic-card';
import Marquee from '@/components/magicui/marquee';
import OrbitingCircles from '@/components/magicui/orbiting-circles';
import SparklesText from '@/components/magicui/sparkles-text';
import { componentProps } from '@/lib/component-props';
import { ComponentDefinition } from './TemplateBuilder';

export const EASYUI_COMPONENTS = {
  AnimatedBadge,
  AnimatedBeam,
  BeamButton,
  BeamCard,
  ColoredButton,
  CreateNew,
  FeatureCard,
  FileUploadCard,
  FireflyButton,
  GlitchText,
  HexagonHero,
  Highlighter,
  HoverButton,
  IdeaForm,
  KeyButton,
  LogoParticles,
  PixelCard,
  ReactionBar,
  SearchCommand,
  SignatureAnimation,
  SparkleButton,
  TiltMotion,
};

export const MAGICUI_COMPONENTS = {
  AnimatedBeamMultipleOutputs,
  AnimatedGradientText,
  AnimatedShinyText,
  AnimatedSubscribeButton,
  BentoGrid,
  BorderBeam,
  LinearGradient,
  MagicCard,
  Marquee,
  OrbitingCircles,
  SparklesText,
};

const getCategory = (name: string) => {
  if (name.includes('Button')) return 'Buttons';
  if (name.includes('Card') || name.includes('Badge')) return 'Display';
  if (name.includes('Hero') || name.includes('Grid')) return 'Layout';
  if (name.includes('Form')) return 'Forms';
  if (name.includes('Text') || name.includes('Highlighter')) return 'Typography';
  return 'Animation';
};

export const COMPONENT_MAP: Record<string, ComponentDefinition> = {
  ...Object.entries(EASYUI_COMPONENTS).reduce(
    (acc, [key, component]) => {
      const componentName = key.replace(/([A-Z])/g, ' $1').trim();
      const defaultProps =
        key === 'ConfettiPoll'
          ? {
              question: 'What is your favorite framework?',
              pollOptions: [
                { id: '1', text: 'React', votes: 10, percentage: 50 },
                { id: '2', text: 'Vue', votes: 5, percentage: 25 },
                { id: '3', text: 'Svelte', votes: 5, percentage: 25 },
              ],
              author: {
                name: 'Easy UI',
                username: 'easy-ui',
                avatar: 'https://github.com/easy-ui.png',
              },
              stats: {
                views: 1000,
                likes: 500,
                comments: 100,
              },
            }
          : {};

      const propsSchema = componentProps[key]
        ? z.object(Object.entries(componentProps[key]).reduce((schema, [prop, config]) => {
            let group = 'General';
            if (['className', 'style', 'width', 'height'].includes(prop)) group = 'Layout';
            if (['color', 'backgroundColor', 'variant', 'beamColor', 'glowColor', 'hoverColor'].includes(prop)) group = 'Appearance';
            if (['children', 'text', 'title', 'description', 'placeholder', 'buttonText', 'logoText'].includes(prop)) group = 'Content';
            if (['duration', 'reverse', 'speed'].includes(prop)) group = 'Animation';

            let zodType: z.ZodTypeAny;
            switch (config.type) {
              case 'number': zodType = z.number(); break;
              case 'boolean': zodType = z.boolean(); break;
              case 'color': zodType = z.string().regex(/^#([0-9a-f]{3}){1,2}$/i); break;
              case 'select': zodType = z.enum(config.options?.map(o => o.value) as [string, ...string[]]); break;
              case 'array': zodType = z.array(z.string()); break;
              default: zodType = z.string();
            }

            schema[prop] = zodType.optional().describe(JSON.stringify({
              ...config,
              group,
              tooltip: config.tooltip || `The ${prop} of the component.`
            }));
            return schema;
          }, {} as Record<string, z.ZodTypeAny>))
        : null;

      acc[key] = {
        component,
        displayName: componentName,
        icon: ComponentIcon,
        defaultProps,
        propsSchema,
        defaultSize: { width: 400, height: 200 },
        category: getCategory(key),
        description: `A customizable ${componentName} component.`,
        keywords: [componentName.toLowerCase().replace(/ /g, '-'), 'easyui'],
        isFavorite: false,
      };
      return acc;
    },
    {} as Record<string, ComponentDefinition>,
  ),
  ...Object.entries(MAGICUI_COMPONENTS).reduce(
    (acc, [key, component]) => {
      const componentName = key.replace(/([A-Z])/g, ' $1').trim();
      const propsSchema = componentProps[key]
        ? z.object(Object.entries(componentProps[key]).reduce((schema, [prop, config]) => {
            let group = 'General';
            if (['className', 'style', 'width', 'height', 'size'].includes(prop)) group = 'Layout';
            if (['fromColor', 'toColor', 'color'].includes(prop)) group = 'Appearance';
            if (['children', 'text', 'buttonText'].includes(prop)) group = 'Content';
            if (['duration', 'reverse', 'speed', 'direction', 'radius'].includes(prop)) group = 'Animation';

            let zodType: z.ZodTypeAny;
            switch (config.type) {
              case 'number': zodType = z.number(); break;
              case 'boolean': zodType = z.boolean(); break;
              case 'color': zodType = z.string().regex(/^#([0-9a-f]{3}){1,2}$/i); break;
              case 'select': zodType = z.enum(config.options?.map(o => o.value) as [string, ...string[]]); break;
              case 'array': zodType = z.array(z.string()); break;
              default: zodType = z.string();
            }

            schema[prop] = zodType.optional().describe(JSON.stringify({
              ...config,
              group,
              tooltip: `The ${prop} of the component.`
            }));
            return schema;
          }, {} as Record<string, z.ZodTypeAny>))
        : null;

      acc[key] = {
        component,
        displayName: componentName,
        icon: ComponentIcon,
        defaultProps: {},
        propsSchema,
        defaultSize: { width: 400, height: 200 },
        category: getCategory(key),
        description: `A customizable ${componentName} component from Magic UI.`,
        keywords: [componentName.toLowerCase().replace(/ /g, '-'), 'magicui'],
        isFavorite: false,
      };
      return acc;
    },
    {} as Record<string, ComponentDefinition>,
  ),
};

export type ComponentId = keyof typeof COMPONENT_MAP;
