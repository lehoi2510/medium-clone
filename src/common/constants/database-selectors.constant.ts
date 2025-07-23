export const AUTHOR_SELECT_FIELDS = {
  id: true,
  username: true,
  email: true,
  bio: true,
  image: true,
} as const;

export const ARTICLE_INCLUDE_AUTHOR = {
  author: {
    select: AUTHOR_SELECT_FIELDS,
  },
} as const;
