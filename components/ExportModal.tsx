'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { componentProps } from '@/lib/component-props';
import { ComponentType } from '@/types/template-builder';

interface ExportModalProps {
  components: ComponentType[];
  setShowExportModal: (show: boolean) => void;
}

export function ExportModal({ components, setShowExportModal }: ExportModalProps) {
  const generateCode = () => {
    const imports = [...new Set(components.map(c => {
      // Determine the correct import path based on component name convention
      const isEasyUi = c.content.startsWith('Animated') || c.content.includes('Button') || c.content.includes('Card') || c.content.includes('Form') || c.content.includes('List') || c.content.includes('Text') || c.content.includes('Hero') || c.content.includes('Launchpad') || c.content.includes('Particles') || c.content.includes('Reaction') || c.content.includes('Search') || c.content.includes('Signature') || c.content.includes('Tilt');
      const path = isEasyUi ? `easyui/${c.content.toLowerCase()}` : `magicui/${c.content.toLowerCase()}`;

      // Handle default exports for magicui components
      const componentName = isEasyUi ? c.content : 'default';
      return `import ${componentName} from "@/components/${path}";`;
    }))].join('\n');

    const componentCode = components.map(c => {
      const defaultProps = componentProps[c.content] || {};
      const props = Object.entries(c.props).map(([key, value]) => {
        // Only include prop if it's different from its default value
        if (defaultProps[key] && defaultProps[key].default === value) {
          return '';
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      }).filter(Boolean).join(' ');
      return `<${c.content} ${props} />`;
    }).join('\n');

    return `${imports}\n\nexport default function MyTemplate() {\n  return (\n    <div>\n      ${componentCode}\n    </div>\n  );\n}`;;
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="p-6 w-1/2 bg-white rounded-lg shadow-lg dark:bg-gray-900">
        <h2 className="mb-4 text-2xl font-bold">Export Code</h2>
        <div className="p-4 bg-gray-800 rounded-md">
          <SyntaxHighlighter language="jsx" style={vscDarkPlus} customStyle={{ background: 'transparent', border: 'none' }}>
            {generateCode()}
          </SyntaxHighlighter>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigator.clipboard.writeText(generateCode())}
            className="px-4 py-2 mr-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
