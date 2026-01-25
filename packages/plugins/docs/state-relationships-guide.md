# State Relationships Guide

This guide explains how to define and manage relationships between data collections in the Dooksa state management system. Relationships enable data integrity, cascade operations, and efficient data retrieval.

## Overview

Relationships in Dooksa state are bidirectional links between collections that:

1. **Maintain Data Integrity**: Ensure related data stays consistent
2. **Enable Cascade Operations**: Automatically delete or update related data
3. **Support Data Expansion**: Retrieve related data in a single query
4. **Track Dependencies**: Know what data depends on other data

## How Relationships Work

### Bidirectional Links

When you define a relationship, Dooksa maintains two-way references:

```javascript
// Collection A references Collection B
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      profileId: {
        type: 'string',
        relation: 'user/details'  // References 'user/details' collection
      }
    }
  }
}
```

**Internal Storage:**
- `relations['user/profiles/abc123'] = ['user/details/def456']` (what A references)
- `relationsInUse['user/details/def456'] = ['user/profiles/abc123']` (what references B)

### Relationship Types

#### One-to-One Relationship

A document in one collection references a single document in another collection.

```javascript
// User profile references a single details document
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            detailsId: {
              type: 'string',
              relation: 'user/details'
            }
          }
        }
      },
      details: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bio: { type: 'string' },
            avatar: { type: 'string' }
          }
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create user profile
const profile = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe', detailsId: 'details-123' }
})

// Create related details
stateSetValue({
  name: 'user/details',
  value: { bio: 'Software developer', avatar: 'avatar.jpg' },
  options: { id: 'details-123' }
})

// Relationship is automatically tracked
// relations['user/profiles/abc123'] = ['user/details/def456']
// relationsInUse['user/details/def456'] = ['user/profiles/abc123']
```

#### One-to-Many Relationship

A document in one collection references multiple documents in another collection.

```javascript
// User profile can have multiple sessions
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      },
      sessions: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: {
              type: 'string',
              relation: 'user/profiles'
            },
            token: { type: 'string' }
          }
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create user profile
const profile = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe' }
})

// Create multiple sessions for the user
stateSetValue({
  name: 'user/sessions',
  value: { userId: profile.id, token: 'session1' }
})

stateSetValue({
  name: 'user/sessions',
  value: { userId: profile.id, token: 'session2' }
})

// Multiple relationships
// relations['user/profiles/abc123'] = ['user/sessions/def456', 'user/sessions/ghi789']
// relationsInUse['user/sessions/def456'] = ['user/profiles/abc123']
// relationsInUse['user/sessions/ghi789'] = ['user/profiles/abc123']
```

#### Many-to-Many Relationship

Documents in one collection can reference multiple documents in another collection, and vice versa.

```javascript
// Posts can have multiple tags, tags can be used in multiple posts
createPlugin('content', {
  state: {
    schema: {
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            tagIds: {
              type: 'array',
              items: { type: 'string' },
              relation: 'content/tags'
            }
          }
        }
      },
      tags: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create tags
const tag1 = stateSetValue({
  name: 'content/tags',
  value: { name: 'javascript' }
})

const tag2 = stateSetValue({
  name: 'content/tags',
  value: { name: 'nodejs' }
})

// Create post with multiple tags
const post = stateSetValue({
  name: 'content/posts',
  value: {
    title: 'Getting Started',
    tagIds: [tag1.id, tag2.id]
  }
})

// Relationships are tracked for each tag
// relations['content/posts/post-123'] = ['content/tags/tag-1', 'content/tags/tag-2']
// relationsInUse['content/tags/tag-1'] = ['content/posts/post-123']
// relationsInUse['content/tags/tag-2'] = ['content/posts/post-123']
```

## Defining Relationships

### In Schema Properties

The most common way to define relationships is in property definitions:

```javascript
{
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      relation: 'user/profiles'  // References the 'user/profiles' collection
    }
  }
}
```

### In Array Items

For arrays that contain references to other collections:

```javascript
{
  type: 'array',
  items: {
    type: 'string',
    relation: 'content/tags'  // Each string in the array references a tag
  }
}
```

### In Collection Items

For collection items that reference other collections:

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      authorId: {
        type: 'string',
        relation: 'user/profiles'
      },
      categoryIds: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'content/categories'
        }
      }
    }
  }
}
```

## Relationship Management

### Automatic Relationship Tracking

When you set data with relationship properties, Dooksa automatically tracks the relationships:

```javascript
// Setting data with relationship
stateSetValue({
  name: 'content/posts',
  value: {
    title: 'My Post',
    authorId: 'user-123',  // This property has a relation
    tagIds: ['tag-1', 'tag-2']  // This array has a relation
  }
})

// Automatic tracking:
// 1. Extracts relationship values (authorId, tagIds)
// 2. Creates bidirectional links
// 3. Stores in relations and relationsInUse
```

## Cascade Operations

### Cascade Delete

When you delete a document with relationships, you can automatically delete related data:

```javascript
// Delete user profile with cascade
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})

// This will also delete:
// - All sessions where userId = 'user-123'
// - All posts where authorId = 'user-123'
// - All related data in other collections
```

### Cascade Update

Update operations can also cascade through relationships:

```javascript
// Update user profile
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Updated' },
  options: { id: 'user-123', merge: true }
})

// If you need to update related data:
const relatedData = stateGetValue({
  name: 'user/sessions',
  options: {
    expand: true  // Get related data
  }
})

// Then update each related item
relatedData.expand.forEach(session => {
  if (session.item.userId === 'user-123') {
    stateSetValue({
      name: 'user/sessions',
      value: { userName: 'John Updated' },
      options: { id: session.id, merge: true }
    })
  }
})
```

## Data Expansion

### Retrieving Related Data

The `getValue` action supports data expansion to retrieve related documents in a single query:

```javascript
// Get post with expanded author and tags
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: {
    expand: true  // Fetch related data
  }
})

// Result structure:
// post.item = { title: 'My Post', authorId: 'user-123', tagIds: ['tag-1', 'tag-2'] }
// post.expand = [
//   { collection: 'user/profiles', id: 'user-123', item: { name: 'John' } },
//   { collection: 'content/tags', id: 'tag-1', item: { name: 'javascript' } },
//   { collection: 'content/tags', id: 'tag-2', item: { name: 'nodejs' } }
// ]
```

### Nested Expansion

Expansion can be nested to multiple levels:

```javascript
// Get post -> author -> author's details
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: {
    expand: true
  }
})

// The expansion will include:
// 1. The post itself
// 2. The author (user/profiles)
// 3. Any related data the author references (user/details)
```

### Expansion with Cloning

To get independent copies of expanded data:

```javascript
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: {
    expand: true,
    expandClone: true,  // Clone expanded data
    clone: true         // Clone main data
  }
})

// Now post.item and post.expand are deep clones
// Modifying them won't affect the original state
```

## Querying with Relationships

### Find by Relationship

You can find documents based on relationship values:

```javascript
// Find all posts by a specific author
const authorPosts = stateFind({
  name: 'content/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' }
  ]
})

// Find all sessions for a user
const userSessions = stateFind({
  name: 'user/sessions',
  where: [
    { name: 'userId', op: '==', value: 'user-123' }
  ]
})
```

### Complex Queries

Combine relationship queries with other conditions:

```javascript
// Find recent posts by a specific author with specific tags
const recentPosts = stateFind({
  name: 'content/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' },
    { name: 'createdAt', op: '>', value: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { name: 'tagIds', op: 'includes', value: 'tag-1' }
  ]
})
```

## Relationship Validation

### Automatic Validation

Relationships are validated automatically when data is set:

```javascript
// Schema
{
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      relation: 'user/profiles'
    }
  }
}

// Valid - references existing user
stateSetValue({
  name: 'content/posts',
  value: { userId: 'user-123' }
})

// Invalid - references non-existent user (if validation is strict)
// This would throw an error or create a broken relationship
```

### Referential Integrity

Dooksa tracks relationships to maintain referential integrity:

```javascript
// Check if data is in use before deletion
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: false
})

if (result.inUse) {
  console.log('Cannot delete: data is referenced by other data')
  // result.inUse = true
  // result.deleted = false
} else {
  console.log('Data deleted successfully')
  // result.inUse = false
  // result.deleted = true
}
```

## Practical Examples

### Example 1: Blog System

```javascript
createPlugin('blog', {
  state: {
    schema: {
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: {
              type: 'string',
              relation: 'user/profiles'
            },
            categoryIds: {
              type: 'array',
              items: {
                type: 'string',
                relation: 'blog/categories'
              }
            },
            tagIds: {
              type: 'array',
              items: {
                type: 'string',
                relation: 'blog/tags'
              }
            },
            published: { type: 'boolean', default: false }
          },
          required: ['title', 'content', 'authorId']
        }
      },
      categories: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      tags: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      },
      comments: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            postId: {
              type: 'string',
              relation: 'blog/posts'
            },
            authorId: {
              type: 'string',
              relation: 'user/profiles'
            },
            content: { type: 'string' },
            parentId: {
              type: 'string',
              relation: 'blog/comments'
            }
          },
          required: ['postId', 'authorId', 'content']
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create categories
const techCategory = stateSetValue({
  name: 'blog/categories',
  value: { name: 'Technology', description: 'Tech articles' }
})

const newsCategory = stateSetValue({
  name: 'blog/categories',
  value: { name: 'News', description: 'Latest news' }
})

// Create tags
const jsTag = stateSetValue({
  name: 'blog/tags',
  value: { name: 'javascript' }
})

const nodeTag = stateSetValue({
  name: 'blog/tags',
  value: { name: 'nodejs' }
})

// Create a post with relationships
const post = stateSetValue({
  name: 'blog/posts',
  value: {
    title: 'Getting Started with Dooksa',
    content: 'Dooksa is a powerful state management system...',
    authorId: 'user-123',
    categoryIds: [techCategory.id],
    tagIds: [jsTag.id, nodeTag.id]
  }
})

// Add a comment
const comment = stateSetValue({
  name: 'blog/comments',
  value: {
    postId: post.id,
    authorId: 'user-456',
    content: 'Great article!'
  }
})

// Add a reply to the comment
stateSetValue({
  name: 'blog/comments',
  value: {
    postId: post.id,
    authorId: 'user-123',
    content: 'Thanks for reading!',
    parentId: comment.id
  }
})

// Get post with all related data
const fullPost = stateGetValue({
  name: 'blog/posts',
  id: post.id,
  options: { expand: true }
})

// fullPost contains:
// - The post itself
// - Author (user/profiles)
// - Categories
// - Tags
// - Comments (and their authors)
```

### Example 2: E-commerce System

```javascript
createPlugin('ecommerce', {
  state: {
    schema: {
      products: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            categoryId: {
              type: 'string',
              relation: 'ecommerce/categories'
            },
            inventory: {
              type: 'object',
              properties: {
                stock: { type: 'number', default: 0 },
                reserved: { type: 'number', default: 0 }
              }
            }
          },
          required: ['name', 'price', 'categoryId']
        }
      },
      categories: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            parentId: {
              type: 'string',
              relation: 'ecommerce/categories'
            }
          }
        }
      },
      orders: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: {
              type: 'string',
              relation: 'user/profiles'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    relation: 'ecommerce/products'
                  },
                  quantity: { type: 'number' },
                  price: { type: 'number' }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered'],
              default: 'pending'
            }
          },
          required: ['userId', 'items']
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create categories
const electronics = stateSetValue({
  name: 'ecommerce/categories',
  value: { name: 'Electronics' }
})

const laptops = stateSetValue({
  name: 'ecommerce/categories',
  value: { name: 'Laptops', parentId: electronics.id }
})

// Create products
const laptop = stateSetValue({
  name: 'ecommerce/products',
  value: {
    name: 'MacBook Pro',
    price: 1999.99,
    categoryId: laptops.id,
    inventory: { stock: 10 }
  }
})

// Create an order
const order = stateSetValue({
  name: 'ecommerce/orders',
  value: {
    userId: 'user-123',
    items: [
      { productId: laptop.id, quantity: 1, price: 1999.99 }
    ]
  }
})

// Get order with expanded data
const fullOrder = stateGetValue({
  name: 'ecommerce/orders',
  id: order.id,
  options: { expand: true }
})

// fullOrder contains:
// - Order details
// - User information
// - Product details for each item
```

### Example 3: Social Network

```javascript
createPlugin('social', {
  state: {
    schema: {
      users: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      },
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            authorId: {
              type: 'string',
              relation: 'social/users'
            },
            content: { type: 'string' },
            likeIds: {
              type: 'array',
              items: {
                type: 'string',
                relation: 'social/users'
              }
            }
          }
        }
      },
      friendships: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId1: {
              type: 'string',
              relation: 'social/users'
            },
            userId2: {
              type: 'string',
              relation: 'social/users'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'blocked'],
              default: 'pending'
            }
          }
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create users
const alice = stateSetValue({
  name: 'social/users',
  value: { name: 'Alice', email: 'alice@example.com' }
})

const bob = stateSetValue({
  name: 'social/users',
  value: { name: 'Bob', email: 'bob@example.com' }
})

// Create a post
const post = stateSetValue({
  name: 'social/posts',
  value: {
    authorId: alice.id,
    content: 'Hello world!'
  }
})

// Bob likes the post
stateSetValue({
  name: 'social/posts',
  value: { likeIds: [bob.id] },
  options: { id: post.id, update: { method: 'push' } }
})

// Create friendship
stateSetValue({
  name: 'social/friendships',
  value: {
    userId1: alice.id,
    userId2: bob.id,
    status: 'accepted'
  }
})

// Get Alice's feed (posts from friends)
const friends = stateFind({
  name: 'social/friendships',
  where: [
    { name: 'userId1', op: '==', value: alice.id },
    { name: 'status', op: '==', value: 'accepted' }
  ]
})

const friendIds = friends.map(f => f.item.userId2)
const feed = stateFind({
  name: 'social/posts',
  where: [
    { name: 'authorId', op: 'in', value: friendIds }
  ]
})
```

## Best Practices

### 1. Use Descriptive Property Names

```javascript
// Good
{
  authorId: { type: 'string', relation: 'user/profiles' },
  categoryIds: { type: 'array', items: { type: 'string', relation: 'blog/categories' } }
}

// Avoid
{
  ref1: { type: 'string', relation: 'user/profiles' },
  refs: { type: 'array', items: { type: 'string', relation: 'blog/categories' } }
}
```

### 2. Define Relationships in Both Directions

```javascript
// Good - both collections reference each other
createPlugin('blog', {
  state: {
    schema: {
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            authorId: { type: 'string', relation: 'user/profiles' }
          }
        }
      },
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  }
})
```

### 3. Use Cascade Operations Wisely

```javascript
// Good - cascade for dependent data
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true  // Delete sessions, posts, etc.
})

// Avoid - cascade for independent data
stateDeleteValue({
  name: 'blog/categories',
  id: 'cat-1',
  cascade: true  // Might delete posts that shouldn't be deleted
})
```

### 4. Expand Data When Needed

```javascript
// Good - expand for display
const post = stateGetValue({
  name: 'blog/posts',
  id: 'post-123',
  options: { expand: true }
})

// Avoid - multiple queries
const post = stateGetValue({ name: 'blog/posts', id: 'post-123' })
const author = stateGetValue({ name: 'user/profiles', id: post.item.authorId })
const tags = stateGetValue({ name: 'blog/tags', id: post.item.tagIds[0] })
```

### 5. Check Referential Integrity

```javascript
// Good - check before deletion
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})

if (result.inUse) {
  // Handle the case where data is referenced
  console.log('Cannot delete: data is in use')
}

// Or use cascade
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})
```

## Common Pitfalls

### Pitfall 1: Circular Dependencies

```javascript
// ❌ Problem: Circular relationship
createPlugin('problem', {
  state: {
    schema: {
      users: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            managerId: { type: 'string', relation: 'problem/users' }
          }
        }
      }
    }
  }
})

// This can cause infinite loops in expansion
// Solution: Limit expansion depth or use separate collections
```

### Pitfall 2: Orphaned Relationships

```javascript
// ❌ Problem: Deleting without cascade
stateDeleteValue({ name: 'user/profiles', id: 'user-123' })
// Now posts with authorId='user-123' have broken relationships

// ✅ Solution: Use cascade or manually clean up
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})
```

### Pitfall 3: Too Many Relationships

```javascript
// ❌ Problem: Overly complex relationships
createPlugin('overkill', {
  state: {
    schema: {
      a: { type: 'collection', items: { type: 'object', properties: { bId: { type: 'string', relation: 'overkill/b' } } } },
      b: { type: 'collection', items: { type: 'object', properties: { cId: { type: 'string', relation: 'overkill/c' } } } },
      c: { type: 'collection', items: { type: 'object', properties: { dId: { type: 'string', relation: 'overkill/d' } } } },
      d: { type: 'collection', items: { type: 'object', properties: { aId: { type: 'string', relation: 'overkill/a' } } } }
    }
  }
})

// ✅ Solution: Simplify the data model
```

## Performance Considerations

### 1. Limit Expansion Depth

```javascript
// Good - expand only what's needed
const post = stateGetValue({
  name: 'blog/posts',
  id: 'post-123',
  options: { expand: true }
})

// Avoid - excessive expansion
// If posts reference comments, and comments reference users, and users reference profiles...
// This could result in a very large data structure
```

### 2. Use Selective Queries

```javascript
// Good - find specific relationships
const userPosts = stateFind({
  name: 'blog/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' }
  ]
})

// Avoid - get all and filter manually
const allPosts = stateGetValue({ name: 'blog/posts' })
const userPosts = allPosts.item.filter(post => post.authorId === 'user-123')
```

### 3. Batch Operations

```javascript
// Good - batch updates
const posts = stateFind({
  name: 'blog/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' }
  ]
})

posts.forEach(post => {
  stateSetValue({
    name: 'blog/posts',
    value: { status: 'archived' },
    options: { id: post.id, merge: true }
  })
})

// Avoid - individual operations without batching
```

## Testing Relationships

### Test Relationship Creation

```javascript
import { test } from 'node:test'
import { strictEqual, deepEqual } from 'node:assert'

test('relationships are created correctly', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        posts: {
          type: 'collection',
          items: {
            type: 'object',
            properties: {
              authorId: { type: 'string', relation: 'test/users' }
            }
          }
        },
        users: {
          type: 'collection',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          }
        }
      }
    }
  })

  // Create user
  const user = plugin.stateSetValue({
    name: 'test/users',
    value: { name: 'John' }
  })

  // Create post with relationship
  const post = plugin.stateSetValue({
    name: 'test/posts',
    value: { authorId: user.id }
  })

  // Verify relationship exists
  strictEqual(plugin.state.relations[`test/users/${user.id}`][0], `test/posts/${post.id}`)
  strictEqual(plugin.state.relationsInUse[`test/posts/${post.id}`][0], `test/users/${user.id}`)
})
```

### Test Cascade Delete

```javascript
test('cascade delete works correctly', async (t) => {
  // Setup
  const user = plugin.stateSetValue({
    name: 'test/users',
    value: { name: 'John' }
  })

  plugin.stateSetValue({
    name: 'test/posts',
    value: { authorId: user.id }
  })

  // Delete with cascade
  const result = plugin.stateDeleteValue({
    name: 'test/users',
    id: user.id,
    cascade: true
  })

  // Verify deletion
  strictEqual(result.deleted, true)
  strictEqual(result.inUse, false)
})
```

### Test Data Expansion

```javascript
test('data expansion includes related items', async (t) => {
  const user = plugin.stateSetValue({
    name: 'test/users',
    value: { name: 'John' }
  })

  const post = plugin.stateSetValue({
    name: 'test/posts',
    value: { content: 'Hello', authorId: user.id }
  })

  const expanded = plugin.stateGetValue({
    name: 'test/posts',
    id: post.id,
    options: { expand: true }
  })

  // Verify expansion
  strictEqual(expanded.expand.length, 1)
  strictEqual(expanded.expand[0].item.name, 'John')
})
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn about schema definitions
- Read [State Default Values Guide](state-default-values-guide.md) for default value configuration
- Read [State Data Types Guide](state-data-types-guide.md) for detailed type information
- Read [State Validation Guide](state-validation-guide.md) for advanced validation rules