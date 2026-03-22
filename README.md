# Stripe Elements

## ABOUT

This project is meant to provide quick, simple and customizable demos of Stripe's various frontend components.

### To run:
- npm run server
- npm run sync-snippet && npm run client

### Running the snippets tester
- cd snippet-tester && npm run dev
- npm run snippet-servers

## TODO

### High Priority

- **Better sidebar option handling**: Current approach resets mode globally and requires a lot of awkward conditionals to account for different cases.
- **Fix checkout snippets**: They broken :(
- **Write actual "abouts" for all elements**: Current content is placeholder


### Medium priority

- **More integrations**: I just need more.
  - **Paymnent request button**
  - **Embedded checkout**
  - **Hosted checkout**
  - **Connect Embedded — Issuing**: Add card issuing demo. Requires creating connected accounts with `card_issuing` capability, then use `issuing_card` and `issuing_cards_list` components.
  - **Connect Embedded — Treasury**: Add financial accounts demo. Requires creating connected accounts with `treasury` capability, then use `financial_account` and `financial_account_transactions` components.

### Nice to Have

- **Add element selector option** - Allow users to toggle which elements render within each integration (address element, express checkout element, etc.)
- **Move snippet sync logic into client folder** - Right now sync-snippets.js lives at the root and has to be run separately before building. Move it into the client so it can run as part of the normal build process and CICD doesn't need a special command.
