# FarmBox Comprehensive Test Plan

## Overview
This document contains all testing scenarios for the FarmBox platform, organized by feature area. Tests are designed from the perspective of typical platform users (Customer, Farmer, Admin).

**Test Environment:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Test Credentials:
  - Admin: admin@farmbox.tn / admin123
  - Farmer: ahmed@fermebensalem.tn / farmer123
  - Customer: sonia@example.tn / customer123

---

## 1. Authentication Tests

### 1.1 Registration
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-001 | Register new customer | POST /api/auth/register with valid email, password (6+ chars), name, phone | 201 Created, returns user + token |
| AUTH-002 | Register new farmer | POST /api/auth/register with role=FARMER | 201 Created, user has FARMER role |
| AUTH-003 | Register with existing email | POST /api/auth/register with duplicate email | 400 Error "Email already exists" |
| AUTH-004 | Register with invalid email format | POST /api/auth/register with "invalid-email" | 400 Validation error |
| AUTH-005 | Register with short password | POST /api/auth/register with password < 6 chars | 400 Validation error |
| AUTH-006 | Register with missing required fields | POST /api/auth/register without email | 400 Validation error |
| AUTH-007 | Register with invalid phone format | POST /api/auth/register with malformed phone | 400 Validation error |

### 1.2 Login
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-008 | Login with valid credentials | POST /api/auth/login with correct email/password | 200 OK, returns user + token |
| AUTH-009 | Login with wrong password | POST /api/auth/login with incorrect password | 401 Invalid credentials |
| AUTH-010 | Login with non-existent email | POST /api/auth/login with unknown email | 401 Invalid credentials |
| AUTH-011 | Login with empty credentials | POST /api/auth/login with empty body | 400 Validation error |
| AUTH-012 | Token persistence | Login, close browser, reopen | Token persists in localStorage |

### 1.3 Profile Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| AUTH-013 | Get profile authenticated | GET /api/auth/profile with valid token | 200 OK, returns user data |
| AUTH-014 | Get profile without token | GET /api/auth/profile without Authorization header | 401 Unauthorized |
| AUTH-015 | Get profile with expired token | GET /api/auth/profile with expired JWT | 401 Unauthorized |
| AUTH-016 | Update profile | PUT /api/auth/profile with name, phone, address, city, zone | 200 OK, returns updated user |
| AUTH-017 | Update profile partial | PUT /api/auth/profile with only name | 200 OK, only name changes |
| AUTH-018 | Change password | PUT /api/auth/password with currentPassword, newPassword | 200 OK, password changed |
| AUTH-019 | Change password wrong current | PUT /api/auth/password with incorrect currentPassword | 400 Incorrect password |
| AUTH-020 | Change password too short | PUT /api/auth/password with newPassword < 6 chars | 400 Validation error |

---

## 2. Product Discovery Tests

### 2.1 Browse Products
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PROD-001 | Get all products | GET /api/products | 200 OK, returns product array |
| PROD-002 | Get products with pagination | GET /api/products?limit=10&offset=0 | Returns 10 products max |
| PROD-003 | Filter by category | GET /api/products?category=vegetables | Only vegetable products |
| PROD-004 | Filter by farm | GET /api/products?farmId={id} | Only products from that farm |
| PROD-005 | Filter available only | GET /api/products?available=true | Only isAvailable=true products |
| PROD-006 | Search products | GET /api/products?search=tomate | Products matching "tomate" |
| PROD-007 | Get single product | GET /api/products/{id} | 200 OK, full product details |
| PROD-008 | Get non-existent product | GET /api/products/invalid-id | 404 Not found |
| PROD-009 | Get product categories | GET /api/products/categories | Returns 8 categories |

### 2.2 Product Discovery Features
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PROD-010 | Get featured products | GET /api/products/featured | Returns featured products |
| PROD-011 | Get popular products | GET /api/products/popular | Products sorted by popularity score |
| PROD-012 | Get popular with limit | GET /api/products/popular?limit=5 | Returns max 5 products |
| PROD-013 | Get popular by category | GET /api/products/popular?category=fruits | Popular fruits only |
| PROD-014 | Get seasonal products | GET /api/products/seasonal | Products in season for current month |
| PROD-015 | Full-text search | GET /api/products/search?q=bio | Searches name, description, Arabic fields |
| PROD-016 | Search with filters | GET /api/products/search?q=&category=herbs&minPrice=1&maxPrice=5 | Filtered results |
| PROD-017 | Search sorting | GET /api/products/search?sort=price_asc | Sorted by price ascending |
| PROD-018 | Get by category slug | GET /api/products/category/vegetables | Vegetable products |
| PROD-019 | Get similar products | GET /api/products/{id}/similar | Same category products |
| PROD-020 | Record product view | POST /api/products/{id}/view | View count incremented |
| PROD-021 | Record cart addition | POST /api/products/{id}/cart-add | Cart add count incremented |

### 2.3 Categories
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PROD-022 | Browse categories page | Navigate to /categories | 8 categories displayed with icons |
| PROD-023 | Category detail page | Navigate to /categories/vegetables | Products in category shown |
| PROD-024 | Category products sorting | Sort by popularity on category page | Products re-ordered |
| PROD-025 | Invalid category slug | Navigate to /categories/invalid | 404 or empty state |

---

## 3. Farm Discovery Tests

### 3.1 Browse Farms
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FARM-001 | Get all farms | GET /api/farms | Returns active farms |
| FARM-002 | Filter by zone | GET /api/farms?zone=ZONE_A | Farms delivering to Zone A |
| FARM-003 | Search farms | GET /api/farms?search=ben | Farms matching "ben" |
| FARM-004 | Get farm by slug | GET /api/farms/ferme-ben-salem | Full farm details with products |
| FARM-005 | Get non-existent farm | GET /api/farms/invalid-slug | 404 Not found |
| FARM-006 | Farm page shows products | Navigate to /farms/{slug} | Products listed under farm |
| FARM-007 | Farm page shows reviews | Navigate to /farms/{slug} | Reviews and ratings visible |
| FARM-008 | Farm page shows stats | Navigate to /farms/{slug} | Order count, rating shown |

---

## 4. Shopping Cart Tests

### 4.1 Cart Operations
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CART-001 | Add item to empty cart | Click "Add to cart" on product | Item appears in cart, count badge updates |
| CART-002 | Add item with quantity | Set quantity to 3, add to cart | 3 units added |
| CART-003 | Add same item again | Add item already in cart | Quantity increments |
| CART-004 | Add from different farms | Add products from 2 different farms | Both items in single unified cart |
| CART-005 | Update quantity in cart | Change quantity in cart page | Quantity and subtotal update |
| CART-006 | Set quantity to 0 | Decrease quantity to 0 | Item removed from cart |
| CART-007 | Remove item | Click remove button | Item removed, subtotal updates |
| CART-008 | Clear entire cart | Click "Clear cart" | Cart emptied |
| CART-009 | Cart persistence | Add items, refresh page | Cart items preserved (localStorage) |
| CART-010 | Cart subtotal calculation | Add multiple items | Subtotal = sum(price * quantity) |
| CART-011 | Cart badge count | Add 5 total items | Badge shows "5" |
| CART-012 | Empty cart state | View cart with no items | "Your cart is empty" message |
| CART-013 | Min quantity enforcement | Try to add less than minQuantity | Enforces minimum |

---

## 5. Checkout & Order Tests

### 5.1 Checkout Flow
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ORDER-001 | Checkout requires auth | Click checkout while logged out | Redirected to login |
| ORDER-002 | Checkout with empty cart | Navigate to /checkout with empty cart | Error or redirect to cart |
| ORDER-003 | Select delivery type | Choose DELIVERY radio button | Delivery form fields appear |
| ORDER-004 | Select pickup type | Choose PICKUP radio button | Pickup options appear |
| ORDER-005 | Select delivery zone | Choose ZONE_A | Delivery fee calculated (5 TND) |
| ORDER-006 | Zone B fee calculation | Choose ZONE_B | Delivery fee = 8 TND |
| ORDER-007 | Zone C fee calculation | Choose ZONE_C | Delivery fee = 12 TND |
| ORDER-008 | Free delivery threshold | Cart subtotal > zone threshold | Delivery fee = 0 |
| ORDER-009 | Enter delivery address | Fill address textarea | Address saved |
| ORDER-010 | Select time window | Choose "6:00-9:00" or "18:00-21:00" | Time window saved |
| ORDER-011 | Add customer notes | Enter special instructions | Notes saved to order |
| ORDER-012 | View order summary | Checkout page | Items, subtotal, delivery fee, total shown |

### 5.2 Order Creation (Unified)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ORDER-013 | Create unified order | POST /api/orders/unified with cart items | 201 Created, order number returned |
| ORDER-014 | Multi-farm order | Order items from 2+ farms | Single order number, multiple sub-orders |
| ORDER-015 | Order with delivery | Include deliveryType=DELIVERY | Delivery fee applied |
| ORDER-016 | Order with pickup | Include deliveryType=PICKUP | No delivery fee |
| ORDER-017 | Order confirmation page | After successful order | Order number, items, total displayed |
| ORDER-018 | Order creates sub-orders | Unified order with 2 farms | 2 Order records created (one per farm) |
| ORDER-019 | Order status initial | New order | Status = PENDING |
| ORDER-020 | Order with credits | Apply available credits | Credits deducted from total |

### 5.3 Order Management (Customer)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ORDER-021 | Get my orders | GET /api/orders/unified/my | Returns customer's orders |
| ORDER-022 | Filter orders by status | GET /api/orders/unified/my?status=PENDING | Only pending orders |
| ORDER-023 | Get order by ID | GET /api/orders/unified/{id} | Full order details |
| ORDER-024 | Get order by number | GET /api/orders/unified/number/{orderNumber} | Full order details |
| ORDER-025 | Cancel pending order | PATCH /api/orders/unified/{id}/cancel | Status = CANCELLED |
| ORDER-026 | Cancel non-pending order | Try to cancel CONFIRMED order | 400 Error |
| ORDER-027 | Cancel other user's order | Try to cancel another customer's order | 403 Forbidden |
| ORDER-028 | View order history | Navigate to dashboard/orders | Orders listed |
| ORDER-029 | Order detail view | Click on order | Full details shown |

### 5.4 Delivery Schedule
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ORDER-030 | Get delivery schedule | GET /api/orders/delivery-schedule | Zone-based schedule returned |
| ORDER-031 | Next delivery date calculation | Based on zone and current day | Correct next delivery date |
| ORDER-032 | Zone A schedule | ZONE_A delivery | Wednesday delivery |
| ORDER-033 | Zone B schedule | ZONE_B delivery | Thursday delivery |
| ORDER-034 | Zone C schedule | ZONE_C delivery | Thursday delivery |

---

## 6. Subscription Tests

### 6.1 Category Subscriptions
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SUB-001 | Get subscription categories | GET /api/category-subscriptions/categories | Returns available categories |
| SUB-002 | Create subscription | POST /api/category-subscriptions with category, size, frequency | 201 Created |
| SUB-003 | Create with SMALL size | boxSize=SMALL | Price = 29 TND |
| SUB-004 | Create with MEDIUM size | boxSize=MEDIUM | Price = 45 TND |
| SUB-005 | Create with LARGE size | boxSize=LARGE | Price = 69 TND |
| SUB-006 | Create weekly frequency | frequency=WEEKLY | Weekly deliveries |
| SUB-007 | Create biweekly frequency | frequency=BIWEEKLY | Every 2 weeks |
| SUB-008 | Create one-time order | frequency=ONCE | Creates order, not subscription |
| SUB-009 | Select delivery day | deliveryDay=3 (Wednesday) | Deliveries on Wednesday |
| SUB-010 | Add preferences | excludeItems=["cilantro"], notes="..." | Preferences saved |
| SUB-011 | Duplicate subscription | Create 2nd subscription same category | Error or handled gracefully |
| SUB-012 | Get my subscriptions | GET /api/category-subscriptions/my | Returns user's subscriptions |
| SUB-013 | Get subscription details | GET /api/category-subscriptions/{id} | Full subscription info |
| SUB-014 | Preview next box | GET /api/category-subscriptions/{id}/preview | Products in next delivery |

### 6.2 Subscription Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SUB-015 | Pause subscription | POST /api/category-subscriptions/{id}/pause with weeks=2 | Status = PAUSED, pausedUntil set |
| SUB-016 | Pause max duration | POST pause with weeks=5 | Error, max 4 weeks |
| SUB-017 | Pause limit (5th pause) | Try 5th pause in year | Error, max 4 per year |
| SUB-018 | Pause already paused | Pause a PAUSED subscription | Error |
| SUB-019 | Resume subscription | DELETE /api/category-subscriptions/{id}/pause | Status = ACTIVE |
| SUB-020 | Resume non-paused | Resume ACTIVE subscription | Error or no-op |
| SUB-021 | Skip next delivery | POST /api/category-subscriptions/{id}/skip | Skip recorded |
| SUB-022 | Skip limit (3rd skip) | Try 3rd skip in month | Error, max 2 per month |
| SUB-023 | Skip too late | Skip < 48 hours before delivery | Error |
| SUB-024 | Unskip delivery | DELETE /api/category-subscriptions/{id}/skip/{date} | Skip cancelled |
| SUB-025 | Cancel subscription | DELETE /api/category-subscriptions/{id} | Status = CANCELLED |
| SUB-026 | Update subscription | PATCH /api/category-subscriptions/{id} | Settings updated |
| SUB-027 | Access other user's sub | GET subscription not owned | 403 Forbidden |

### 6.3 Farm Subscriptions (Legacy)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SUB-028 | Create farm subscription | POST /api/subscriptions | 201 Created |
| SUB-029 | Get my farm subscriptions | GET /api/subscriptions/my | Returns subscriptions |
| SUB-030 | Pause farm subscription | POST /api/subscriptions/{id}/pause | PAUSED status |
| SUB-031 | Skip farm subscription | POST /api/subscriptions/{id}/skip | Skip recorded |
| SUB-032 | Cancel farm subscription | DELETE /api/subscriptions/{id} | CANCELLED status |

---

## 7. Trial Box Tests

### 7.1 Trial Box Creation
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| TRIAL-001 | Get available farms | GET /api/trial-boxes/available-farms | Farms offering trials |
| TRIAL-002 | Check trial availability | GET /api/trial-boxes/check/{farmId} | Availability status |
| TRIAL-003 | Create trial box | POST /api/trial-boxes with farmId, boxSize | 201 Created, 25% discount |
| TRIAL-004 | Trial SMALL size | boxSize=SMALL | Correct pricing with discount |
| TRIAL-005 | Trial MEDIUM size | boxSize=MEDIUM | Correct pricing with discount |
| TRIAL-006 | Trial LARGE size | boxSize=LARGE | Correct pricing with discount |
| TRIAL-007 | Duplicate trial same farm | Create 2nd trial for same farm | 400 Error |
| TRIAL-008 | Trial different farm | Create trial for different farm | 201 Created |
| TRIAL-009 | Get my trial boxes | GET /api/trial-boxes/my | Returns user's trials |
| TRIAL-010 | Get trial details | GET /api/trial-boxes/{id} | Full trial info |

### 7.2 Trial Box Lifecycle
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| TRIAL-011 | Trial initial status | New trial | Status = PENDING |
| TRIAL-012 | Trial 7-day expiration | Check after 7 days | Status = EXPIRED |
| TRIAL-013 | Place trial order | Order from trial farm | Trial status = ORDERED |
| TRIAL-014 | Trial discount applied | Order total | 25% discount visible |
| TRIAL-015 | Trial delivered | Order delivered | Trial status = DELIVERED |
| TRIAL-016 | Convert to subscription | POST /api/trial-boxes/{id}/convert | Subscription created, status = CONVERTED |
| TRIAL-017 | Convert non-delivered | Try to convert PENDING trial | 400 Error |
| TRIAL-018 | Convert already converted | Try to convert CONVERTED trial | 400 Error |

---

## 8. Quality Reports & Credits Tests

### 8.1 Quality Report Submission
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| QUAL-001 | Submit quality report | POST /api/quality/reports with orderId, issueType | 201 Created |
| QUAL-002 | Report DAMAGED issue | issueType=DAMAGED | 100% item credit |
| QUAL-003 | Report NOT_FRESH issue | issueType=NOT_FRESH | 100% item credit |
| QUAL-004 | Report WRONG_ITEM | issueType=WRONG_ITEM | 100% item credit |
| QUAL-005 | Report MISSING_ITEM | issueType=MISSING_ITEM | 100% item credit |
| QUAL-006 | Report QUANTITY_SHORT | issueType=QUANTITY_SHORT | 50% item credit |
| QUAL-007 | Report TASTE_QUALITY | issueType=TASTE_QUALITY | 50% item credit |
| QUAL-008 | Report OTHER | issueType=OTHER | 0% auto, needs manual review |
| QUAL-009 | Report after 7 days | Submit report > 7 days after delivery | 400 Error |
| QUAL-010 | Report non-delivered order | Report on PENDING order | 400 Error |
| QUAL-011 | Get my reports | GET /api/quality/reports/my | Returns user's reports |
| QUAL-012 | Get report details | GET /api/quality/reports/{id} | Full report info |

### 8.2 Customer Credits
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| QUAL-013 | Get my credits | GET /api/quality/credits/my | Available credit amount |
| QUAL-014 | Get credit history | GET /api/quality/credits/history | Credit transactions |
| QUAL-015 | Credit auto-created | After quality report | CustomerCredit record created |
| QUAL-016 | Credit 90-day expiry | Credit created | expiresAt = +90 days |
| QUAL-017 | Use credits in order | Place order with credits | Credits applied, total reduced |
| QUAL-018 | Credit marked as used | After order uses credit | usedAt populated |
| QUAL-019 | Expired credits | Credit past expiresAt | Not usable |

### 8.3 Delivery Surveys
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| QUAL-020 | Submit survey | POST /api/quality/surveys with ratings | 201 Created |
| QUAL-021 | Survey ratings | overallRating, freshnessRating, etc. | 1-5 range |
| QUAL-022 | Survey reward | Complete survey | 5 TND credit earned |
| QUAL-023 | Duplicate survey | Submit 2nd survey same order | 400 Error |
| QUAL-024 | Get my surveys | GET /api/quality/surveys/my | Returns user's surveys |
| QUAL-025 | Get pending surveys | GET /api/quality/surveys/pending | Orders awaiting survey |

---

## 9. Farmer Dashboard Tests

### 9.1 Farm Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FARMER-001 | Create farm | POST /api/farms (as farmer) | 201 Created |
| FARMER-002 | Get my farm | GET /api/farms/me/farm | Returns farmer's farm |
| FARMER-003 | Update farm | PUT /api/farms/{id} | Farm updated |
| FARMER-004 | Update farm not owned | Update another farmer's farm | 403 Forbidden |
| FARMER-005 | Get farm stats | GET /api/farms/me/stats | Returns analytics |

### 9.2 Product Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FARMER-006 | Create product | POST /api/products (as farmer) | 201 Created |
| FARMER-007 | Get my products | GET /api/products/me/products | Returns farmer's products |
| FARMER-008 | Update product | PUT /api/products/{id} | Product updated |
| FARMER-009 | Update product not owned | Update another farm's product | 403 Forbidden |
| FARMER-010 | Delete product | DELETE /api/products/{id} | Product deleted |
| FARMER-011 | Delete with pending orders | Delete product in pending order | 400 Error |
| FARMER-012 | Toggle availability | PATCH /api/products/{id}/toggle | isAvailable toggled |

### 9.3 Order Management (Farmer)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FARMER-013 | Get farm orders | GET /api/orders/farm/orders | Orders for farmer's farm |
| FARMER-014 | Update order status | PATCH /api/orders/{id}/status | Status changed |
| FARMER-015 | Confirm order | Update PENDING → CONFIRMED | Status = CONFIRMED |
| FARMER-016 | Start preparing | Update CONFIRMED → PREPARING | Status = PREPARING |
| FARMER-017 | Mark out for delivery | Update PREPARING → OUT_FOR_DELIVERY | Status updated |
| FARMER-018 | Mark delivered | Update → DELIVERED | Status = DELIVERED, isPaid = true |
| FARMER-019 | Invalid status transition | PENDING → DELIVERED directly | 400 Error |
| FARMER-020 | Update other farm's order | Update order for different farm | 403 Forbidden |

---

## 10. Admin Tests

### 10.1 Quality Report Management
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| ADMIN-001 | Get all reports | GET /api/quality/admin/reports | All platform reports |
| ADMIN-002 | Filter by status | GET /api/quality/admin/reports?status=PENDING | Filtered results |
| ADMIN-003 | Resolve report | PATCH /api/quality/admin/reports/{id} | Report resolved |
| ADMIN-004 | Manual credit | Resolve with custom creditAmount | Credit created |
| ADMIN-005 | Non-admin access | Customer tries admin endpoints | 403 Forbidden |

---

## 11. Edge Cases & Error Handling

### 11.1 Authentication Edge Cases
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-001 | Malformed JWT | Send invalid token format | 401 Unauthorized |
| EDGE-002 | Tampered JWT | Modify token payload | 401 Unauthorized |
| EDGE-003 | Missing Bearer prefix | Send token without "Bearer " | 401 Unauthorized |
| EDGE-004 | Concurrent sessions | Login from 2 devices | Both sessions valid |
| EDGE-005 | Token refresh | Token near expiry | Still works until expired |

### 11.2 Order Edge Cases
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-006 | Order unavailable product | Product becomes unavailable during checkout | 400 Error |
| EDGE-007 | Order with 0 quantity | Submit order with quantity=0 | 400 Error |
| EDGE-008 | Negative quantity | Submit order with quantity=-1 | 400 Error |
| EDGE-009 | Very large quantity | quantity=999999 | Handled gracefully |
| EDGE-010 | Order from inactive farm | Farm.isActive=false | 400 Error |
| EDGE-011 | Price change during checkout | Price changes after adding to cart | Uses price at order time |
| EDGE-012 | Credits exceed total | Apply credits > order total | Total = 0, remaining credits kept |

### 11.3 Subscription Edge Cases
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-013 | Pause exactly 4 weeks | weeks=4 | Allowed |
| EDGE-014 | Skip on delivery day | Skip same day as delivery | Error or handled |
| EDGE-015 | Skip past date | Skip for date in past | 400 Error |
| EDGE-016 | Modify cancelled sub | Update CANCELLED subscription | 400 Error |
| EDGE-017 | Year-end pause reset | New year starts | pausesUsedThisYear resets |
| EDGE-018 | Month-end skip reset | New month starts | skipsThisMonth resets |

### 11.4 Data Validation
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| EDGE-019 | SQL injection attempt | Include SQL in search query | Sanitized, no injection |
| EDGE-020 | XSS in text fields | Include `<script>` in notes | Sanitized on display |
| EDGE-021 | Very long strings | 10000 char product name | Truncated or rejected |
| EDGE-022 | Unicode characters | Arabic text in fields | Properly stored/displayed |
| EDGE-023 | Special characters | Emoji in product names | Handled correctly |
| EDGE-024 | Null in required fields | Send null for required field | 400 Validation error |

---

## 12. Integration & Flow Tests

### 12.1 Complete User Journeys
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FLOW-001 | New customer first order | Register → Browse → Add to cart → Checkout → Confirm | Order created successfully |
| FLOW-002 | Returning customer reorder | Login → Dashboard → View order → Add same items → Checkout | Order created |
| FLOW-003 | Category subscription flow | Login → /subscriptions/category → Steps 1-3 → Confirm | Subscription active |
| FLOW-004 | Trial to subscription | Create trial → Place order → Receive → Convert | Subscription from trial |
| FLOW-005 | Quality issue flow | Receive order → Report issue → Credit received → Use in next order | Credits applied |
| FLOW-006 | Subscription management | Create → Pause → Resume → Skip → Cancel | All states work |

### 12.2 Multi-Farm Scenarios
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| FLOW-007 | Cart from 3 farms | Add items from 3 different farms | Single unified checkout |
| FLOW-008 | Partial farm unavailable | One farm's product unavailable | Error or partial order |
| FLOW-009 | Mixed zone delivery | Items from farms in different zones | Single delivery fee |

---

## 13. UI/UX Tests

### 13.1 Responsive Design
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| UI-001 | Mobile homepage | View on 375px width | Proper layout |
| UI-002 | Mobile navigation | Open hamburger menu | Menu works |
| UI-003 | Mobile cart | View cart on mobile | Usable interface |
| UI-004 | Mobile checkout | Complete checkout on mobile | All fields accessible |
| UI-005 | Tablet layout | View on 768px width | Proper layout |
| UI-006 | Desktop layout | View on 1440px width | Full layout |

### 13.2 Form Validation (Frontend)
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| UI-007 | Empty required field | Submit form with empty required | Validation message |
| UI-008 | Invalid email format | Enter "invalid" in email field | Validation message |
| UI-009 | Password mismatch | Confirm password different | Validation message |
| UI-010 | Quantity validation | Enter negative in quantity | Input rejected |

### 13.3 Loading States
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| UI-011 | Product list loading | Navigate to /products | Loading spinner shown |
| UI-012 | Button loading state | Click submit on form | Button shows loading |
| UI-013 | Skeleton loading | Navigate to product page | Skeleton UI shown |

---

## 14. Performance Scenarios

### 14.1 Load Handling
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| PERF-001 | Large product catalog | 1000+ products | Pagination works |
| PERF-002 | Many orders | Customer with 100+ orders | List loads efficiently |
| PERF-003 | Search performance | Search across all products | < 2 second response |
| PERF-004 | Concurrent checkouts | Multiple simultaneous orders | All succeed |

---

## 15. API Response Tests

### 15.1 Response Format Validation
| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| API-001 | Success response format | Any successful request | Proper JSON structure |
| API-002 | Error response format | Any error request | `{ error: "message" }` or `{ success: false, error: {...} }` |
| API-003 | Bilingual errors | Quality/trial endpoints | message + messageAr |
| API-004 | Pagination metadata | Paginated endpoints | Includes total, limit, offset |
| API-005 | Timestamps format | Date fields | ISO 8601 format |
| API-006 | Decimal precision | Price fields | 3 decimal places (TND) |

---

## Test Execution Notes

### Prerequisites
1. Run `docker-compose up -d` to start all services
2. Run `npm run db:migrate` then `npm run db:seed` in backend
3. Verify services: frontend :3000, backend :3001, postgres :5432

### Test Categories Priority
1. **Critical Path**: AUTH, CART, ORDER (checkout flow)
2. **Core Features**: PROD, FARM, SUB (browsing, subscriptions)
3. **Engagement**: TRIAL, QUAL (trial boxes, quality)
4. **Admin/Farmer**: FARMER, ADMIN (management)
5. **Edge Cases**: EDGE, FLOW (comprehensive coverage)

### Automation Recommendations
- Use Jest/Supertest for API tests
- Use Cypress/Playwright for E2E tests
- Use React Testing Library for component tests

---

## File Locations for Implementation

- **Test Plan**: `docs/TESTING.md` (this document)
- **Backend Tests**: `backend/src/__tests__/`
- **Frontend Tests**: `frontend/src/__tests__/`
- **E2E Tests**: `frontend/cypress/` or `e2e/`
