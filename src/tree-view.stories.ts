import type { Meta, StoryFn } from '@storybook/vue3';
import TreeView from './tree-view.vue';
import AsyncStory from './stories/async.story.vue';
import DefaultStory from './stories/default.story.vue';
import CustomDataStory from './stories/custom-data.story.vue';

export default {
  title: 'Tree View',
  // TODO: a way to pass the generic to TreeView and remove assertion
  component: TreeView as unknown as Record<string, unknown>,
  tags: ['autodocs'],
  // TODO: bind SB args | setup controls for stories
} satisfies Meta<typeof TreeView>;

type Story = StoryFn<typeof TreeView>;

export const Default: Story = () => DefaultStory;

export const Async: Story = () => AsyncStory;

export const CustomData: Story = () => CustomDataStory;
