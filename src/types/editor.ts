import { ModuleOptions } from './module';
import { InlineAttributes } from '../types/inline';
import { Block } from '../types/block';
import { CaretPosition } from '../types/caret';
import { EventEmitter } from '../utils/event-emitter';
import {
  EditorModule,
  KeyBoardModule,
  ToolbarModule,
  SelectorModule,
  HistoryModule,
  LoggerModule,
} from '../modules';

export interface Settings {
  scrollMarginBottom?: number;
  scrollMarginTop?: number;
  allowAttributes?: string[];
  allowFormats?: string[];
  modules?: ModuleOptions;
  collaborationLevel?: 'block' | 'inline';
}

export interface PositionParams {
  index?: number;
  margin?: number;
}

/*
 * user       => Update your blocks and then save the operation
 * silent     => Update your blocks, then don't save the operation
 */
export type Source = 'user' | 'silent' | 'collaborator';

export interface EditorController {
  focus(): void;
  blur(): void;
  getFormats(blockId: string, index: number, length?: number): InlineAttributes;
  formatText(blockId: string, index: number, length: number, attributes: InlineAttributes): void;
  getBlocks(): Block[];
  getBlock(blockId: string): Block | null;
  getBlockLength(blockId: string): number | null;
  createBlock(appendBlock: Block, prevBlockId?: string): void;
  createBlock(appendBlock: Block, prevBlockId: string, source: Source): void;
  updateBlock(block: Block): void;
  updateBlock(block: Block, source: Source): void;
  deleteBlock(blockId: string): void;
  deleteBlock(blockId: string, source: Source): void;
  sync(blockId?: string, blockElement?: HTMLElement, forceUpdate?: boolean): void;
  setCaretPosition(caretPosition: Partial<CaretPosition>): void;
  getCaretPosition(): CaretPosition | null;
  getNativeRange(): Range | null;
  updateCaretRect(rect?: DOMRect): DOMRect | null;
  prev(params?: PositionParams): boolean;
  next(params?: PositionParams): boolean;
  render(affectedIds?: string[]): void;
  addModule(
    name: string,
    module: {
      new (params: { eventEmitter: EventEmitter; options: any }): any;
    },
    options?: any,
  ): void;
  addModules(
    modules: {
      name: string;
      module: {
        new (params: { eventEmitter: EventEmitter; editor: EditorController; options: any }): any;
      };
    }[],
    options?: ModuleOptions,
  ): void;
  getModule(name: 'editor'): EditorModule;
  getModule(name: 'keyboard'): KeyBoardModule;
  getModule(name: 'toolbar'): ToolbarModule;
  getModule(name: 'selector'): SelectorModule;
  getModule(name: 'history'): HistoryModule;
  getModule(name: 'logger'): LoggerModule;
  getModule<T = any>(name: string): T | null;
  removeAllModules(): void;
  getEventEmitter(): EventEmitter;
}
