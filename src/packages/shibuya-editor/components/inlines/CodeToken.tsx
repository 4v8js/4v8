import * as React from 'react';
import styled from 'styled-components';
import { EditorController } from '../../types/editor';
import { Formats } from '../../types/format';
import { Inline, InlineAttributes } from '../../types/inline';
import { EditorEvents } from '../../constants';

export interface CodeTokenProps {
  inline: Inline;
  formats: Formats;
  editor: EditorController;
  attributes: InlineAttributes;
  scrollContainer?: HTMLElement | string;
}

const Text = styled.span`
  &::selection {
    background: rgba(46, 170, 220, 0.2);
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #8292a2;
  }

  .token.punctuation {
    color: #f8f8f2;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.property,
  .token.tag,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #f92672;
  }

  .token.boolean,
  .token.number {
    color: #ae81ff;
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #a6e22e;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable {
    color: #f8f8f2;
  }

  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.class-name {
    color: #e6db74;
  }

  .token.keyword {
    color: #66d9ef;
  }

  .token.regex,
  .token.important {
    color: #fd971f;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }
`;

export const CodeToken = ({
  inline,
  formats,
  editor,
  scrollContainer,
  attributes,
  ...props
}: CodeTokenProps) => {
  const memoInnerHTML = React.useMemo(() => {
    return {
      __html: inline.text,
    };
  }, [inline]);

  return (
    <Text className={`token ${attributes.tokenType}`} {...props}>
      {inline.text}
    </Text>
  );
};
