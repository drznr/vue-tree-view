import type { Meta, StoryFn } from '@storybook/vue3';
import TreeView from './tree-view.vue';
import AsyncStory from './stories/async.story.vue';
import DefaultStory from './stories/default.story.vue';
import CustomDataStory from './stories/custom-data.story.vue';

export default {
  title: 'Tree View',
  // assertion is needed see: https://github.com/storybookjs/storybook/issues/24238
  component: TreeView as Record<keyof typeof TreeView, unknown>,
  parameters: { options: { showPanel: false } },
  tags: ['autodocs'],
  // TODO: bind SB args | setup controls for stories
} satisfies Meta<typeof TreeView>;

type Story = StoryFn<typeof TreeView>;

export const Default: Story = () => DefaultStory;

export const CustomData: Story = () => CustomDataStory;

export const Async: Story = () => AsyncStory;
