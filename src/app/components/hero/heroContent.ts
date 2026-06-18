export interface HeroSlide {
  url: string;
  label: string;
  caption: string;
}

export const pageContent: Record<string, any> = {
  'content-home': {
    heroSlideshow: {
      slides: [
        {
          url: 'https://images.unsplash.com/photo-1583417657209-d3dd44dc9c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwc3RvbmUlMjBsdXh1cnklMjBpbnRlcmlvciUyMGRhcmslMjBkcmFtYXRpY3xlbnwxfHx8fDE3NzQyNzA3MjR8MA&ixlib=rb-4.1.0&q=80&w=1920',
          label: 'Signature Interiors',
          caption: 'Dark walnut & stone — crafted to command attention',
        },
        {
          url: 'https://images.unsplash.com/photo-1658218729615-167c32d70537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3b29kJTIwaW50ZXJpb3IlMjBiZWRyb29tJTIwS2VueWF8ZW58MXx8fHwxNzc0NDQ5MDEyfDA&ixlib=rb-4.1.0&q=80&w=1920',
          label: 'Bedroom Suites',
          caption: 'Bespoke bedroom furniture built around your space',
        },
        {
          url: 'https://images.unsplash.com/photo-1773867567872-3ad1fa481082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwc3RvbmUlMjBmaXJlcGxhY2UlMjBkYXJrJTIwbHV4dXJ5fGVufDF8fHx8MTc3NDQ0OTAxNXww&ixlib=rb-4.1.0&q=80&w=1920',
          label: 'Stone Feature Walls',
          caption: 'Raw stone transformed into breathtaking focal points',
        },
      ],
      autoPlayInterval: 5000,
    },
  },
};
