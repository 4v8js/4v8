import * as React from 'react';
import styled, { css } from 'styled-components';
import { EditorController } from '../../types/editor';
import { CheckSquare } from '../icons';
import { Formats } from '../../types/format';
import { BlockAttributes } from '../../types/block';
import { useMutationObserver } from '../../hooks/use-mutation-observer';

export interface CheckListProps {
  blockId: string;
  formats?: Formats;
  contents: React.ReactNode;
  placeholder?: string;
  attributes: BlockAttributes;
  editor: EditorController;
}

const ListItem = styled.div<Pick<CheckListProps, 'placeholder'>>`
  font-size: 1rem;
  outline: 0;
  margin: 0;
  padding: 2px 12px 2px;
  padding-left: calc(40px + 1.5em * var(--indent));
  box-sizing: border-box;
  position: relative;
  ${({ placeholder }) => {
    return (
      placeholder &&
      css`
        ::after {
          opacity: 0.3;
          content: attr(placeholder);
        }
      `
    );
  }}
`;
const CheckBoxOuter = styled.div`
  position: absolute;
  left: 4px;
  top: -3px;
  width: 32px;
  height: 32px;
  border-radius: 15%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
`;

export const CheckList = React.memo(
  ({
    blockId,
    contents,
    placeholder = 'Check List',
    attributes,
    editor,
    ...props
  }: CheckListProps) => {
    const headerRef = React.useRef(null);
    const [showPlaceholder, setShowPlaceholder] = React.useState(false);
    const handleChangeElement = React.useCallback(() => {
      if (!headerRef.current) return;
      const innerText = (headerRef.current as HTMLElement).innerText.replaceAll(/\uFEFF/gi, '');
      setShowPlaceholder(innerText.length < 1);
    }, []);
    useMutationObserver(headerRef, handleChangeElement);

    React.useEffect(() => {
      handleChangeElement();
    }, []);

    const handleClickCheckBox = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const currentBlock = editor.getBlock(blockId);
        if (!currentBlock) return;
        editor.updateBlock({
          ...currentBlock,
          attributes: {
            ...currentBlock.attributes,
            checked: !attributes.checked,
          },
        });
        editor.render([blockId]);
      },
      [blockId, attributes],
    );

    const checked = attributes?.checked ?? false;

    return (
      <ListItem
        ref={headerRef}
        spellCheck={false}
        placeholder={showPlaceholder ? placeholder : ''}
        style={{
          textDecoration: checked ? 'line-through' : 'none',
        }}
        {...props}
      >
        <CheckBoxOuter onClick={handleClickCheckBox}>
          <CheckSquare size={32} checked={checked} />
        </CheckBoxOuter>
        {contents}
      </ListItem>
    );
  },
);
