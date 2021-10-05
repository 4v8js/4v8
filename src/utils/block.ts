import { nanoid } from 'nanoid';
import { createInline, isEmbed, getInlineId } from './inline';
import { Block, BlockType, BlockAttributes } from '../types/block';
import { Inline, InlineType } from '../types/inline';

export function createBlock(type: BlockType, contents?: Inline[], attributes?: BlockAttributes): Block {
  return {
    id: nanoid(),
    contents: contents ?? [createInline('TEXT')],
    attributes: attributes ?? {},
    type,
  };
}

export function getBlockId(node: HTMLElement): [string, HTMLElement] | [] {
  if (node.dataset?.blockId) {
    return [node.dataset.blockId, node];
  }
  if (!node.parentElement) {
    return [];
  }
  return getBlockId(node.parentElement);
}

export function getBlockElementById(blockId: string): HTMLElement | null {
  const element = document.querySelector<HTMLElement>('[data-block-id="' + blockId + '"]');
  if (!element) return null;
  return element;
}

export function getBlockLength(block: string | HTMLElement): number | null {
  const element = block instanceof HTMLElement ? block : getBlockElementById(block);
  if (!element) return null;
  let cumulativeLength = 0;
  for (let i = 0; i < element.children.length; i++) {
    const targetElement = element.children[i] as HTMLElement;
    const format = targetElement.dataset.format?.replace(/^inline\//, '').toUpperCase();
    const inlineLength = isEmbed(format as InlineType) ? 1 : targetElement.innerText.replaceAll(/\uFEFF/gi, '').length;
    cumulativeLength += inlineLength;
  }
  return cumulativeLength;
}

export function getInlineContents(block: string | HTMLElement): {
  contents: Inline[];
  affected: boolean;
  affectedLength: number;
} {
  const element = block instanceof HTMLElement ? block : getBlockElementById(block);
  let affectedLength = 0;
  let affected = false;
  if (!element) return { contents: [], affected, affectedLength };

  const contents: Inline[] = Array.from(element.children as HTMLCollectionOf<HTMLElement>).reduce(
    (r: Inline[], inline, currentIndex): Inline[] => {
      const format = inline.dataset.format?.replace(/^inline\//, '').toUpperCase();
      if (!format || !inline.dataset.inlineId) return r;
      if (inline.innerText.match(/\uFEFF$/i)) {
        affected = true;
      }
      if (inline.innerText.match(/^\uFEFF/i)) {
        affectedLength = -1;
        affected = true;
      }

      let text = inline.innerText.replaceAll(/\uFEFF/gi, '');
      text = currentIndex === 0 && text.length < 1 ? '\uFEFF' : text;
      return [
        ...r,
        {
          id: inline.dataset.inlineId,
          attributes: {},
          text,
          type: format as Inline['type'],
          isEmbed: isEmbed(format as Inline['type']),
        },
      ];
    },
    [],
  );

  return { contents, affectedLength, affected };
}

// convert block index to native index
export function getNativeIndexFromBlockIndex(
  block: string | HTMLElement,
  index: number,
): { node: ChildNode; index: number } | null {
  const element = block instanceof HTMLElement ? block : getBlockElementById(block);
  if (!element) return null;
  let cumulativeLength = 0;
  for (let i = 0; i < element.children.length; i++) {
    const targetElement = element.children[i] as HTMLElement;
    const format = targetElement.dataset.format?.replace(/^inline\//, '').toUpperCase();
    if (format) {
      const inlineLength = isEmbed(format as InlineType) ? 1 : targetElement.innerText.length;
      const inlineNode = targetElement.firstChild;
      if (index <= cumulativeLength + inlineLength && inlineNode) {
        return { node: inlineNode instanceof Text ? inlineNode : targetElement, index: index - cumulativeLength };
      }
      cumulativeLength += inlineLength;
    }
  }
  return null;
}

export function getBlockIndexFromNativeIndex(
  ChildNode: HTMLElement,
  offset: number,
): { blockId: string; index: number } | null {
  const [inlineId, inlineElement] = getInlineId(ChildNode);
  const [blockId, blockElement] = getBlockId(ChildNode);
  if (!inlineId || !inlineElement || !blockElement || !blockId) return null;
  let cumulativeLength = 0;
  for (let i = 0; i < blockElement.children.length; i++) {
    const targetElement = blockElement.children[i] as HTMLElement;
    const format = targetElement.dataset.format?.replace(/^inline\//, '').toUpperCase();
    if (format) {
      const inlineLength = isEmbed(format as InlineType) ? 1 : targetElement.innerText.length;
      if (targetElement === inlineElement) {
        return { blockId, index: cumulativeLength + offset };
      }
      cumulativeLength += inlineLength;
    }
  }
  return null;
}

// index is the position to start deleting, and length is the number of characters to delete (default is 1).
export function deleteInlineContents(contents: Inline[], index: number, length: number = 1): Inline[] {
  const startIndex = index;
  const destContents = [];
  let cumulativeLength = 0;
  for (let i = 0; i < contents.length; i++) {
    const inlineLength = contents[i].isEmbed ? 1 : contents[i].text.length;
    if (length > 0 && startIndex >= cumulativeLength && startIndex < cumulativeLength + inlineLength) {
      if (!contents[i].isEmbed) {
        const deleteIndex = startIndex - cumulativeLength;
        const textlength = contents[i].text.length - deleteIndex;
        const deletelength = textlength - length >= 0 ? length : textlength;
        length -= deletelength;
        const text = contents[i].text.slice(0, deleteIndex) + contents[i].text.slice(deleteIndex + deletelength);
        if (text.length > 0) {
          destContents.push({ ...contents[i], text });
        }
      } else {
        length--;
      }
    } else {
      destContents.push(contents[i]);
    }

    cumulativeLength += inlineLength;
  }

  if (destContents.length < 1) {
    destContents.push(createInline('TEXT'));
  }
  return destContents;
}

// length is the string currently selected by the user and to be deleted when splitting.
export function splitInlineContents(contents: Inline[], index: number, length: number = 0): [Inline[], Inline[]] {
  const startIndex = index;
  const firstContents: Inline[] = [];
  const lastContents: Inline[] = [];
  let cumulativeLength = 0;
  for (let i = 0; i < contents.length; i++) {
    const inlineLength = contents[i].isEmbed ? 1 : contents[i].text.length;
    if (startIndex >= cumulativeLength && startIndex < cumulativeLength + inlineLength) {
      if (!contents[i].isEmbed) {
        const deleteIndex = startIndex - cumulativeLength;
        const textlength = contents[i].text.length - deleteIndex;
        const deletelength = textlength - length >= 0 ? length : textlength;
        length -= deletelength;
        const firstText = contents[i].text.slice(0, deleteIndex);
        const lastText = contents[i].text.slice(deleteIndex + deletelength);
        if (firstText.length > 0) {
          firstContents.push({ ...contents[i], text: firstText });
        }
        if (lastText.length > 0) {
          lastContents.push({ ...contents[i], text: lastText });
        }
      } else {
        length--;
        lastContents.push(contents[i]);
      }
    } else {
      if (length > 0) {
        firstContents.push(contents[i]);
      } else {
        lastContents.push(contents[i]);
      }
    }

    cumulativeLength += inlineLength;
  }

  return [firstContents, lastContents];
}
