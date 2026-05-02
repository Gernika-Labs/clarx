export type PreviewSize = 'sm' | 'md' | 'lg' | 'full';

export type PreviewProps = {
  size?: PreviewSize;
  centered?: boolean;
  children: React.ReactNode;
};
