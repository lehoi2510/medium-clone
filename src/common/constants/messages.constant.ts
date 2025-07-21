export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  ARTICLE_NOT_FOUND: 'Article not found',
  ARTICLE_FORBIDDEN_UPDATE: 'You do not have permission to edit this article',
  ARTICLE_FORBIDDEN_DELETE: 'You do not have permission to delete this article',
  EMAIL_USERNAME_EXISTS: 'Email or username already exists',
  ACCOUNT_NOT_EXISTS: 'Account does not exist',
  WRONG_PASSWORD: 'Wrong password',
  CURRENT_PASSWORD_REQUIRED: 'Please enter current password to change to new password',
  CURRENT_PASSWORD_INVALID: 'Current password is incorrect',
} as const;

export const SUCCESS_MESSAGES = {
  ARTICLE_CREATED: 'Article created successfully',
  ARTICLE_UPDATED: 'Article updated successfully',
  ARTICLE_DELETED: 'Article deleted successfully',
  ARTICLES_RETRIEVED: 'Articles retrieved successfully',
  USER_CREATED: 'User created successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_UPDATED: 'User updated successfully',
} as const;
