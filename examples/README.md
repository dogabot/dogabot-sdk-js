# @dogabot/sdk examples (Node)

```bash
export DOGABOT_API_KEY=dbk_live_...
# from sdk/js:
pnpm install && pnpm run build
node examples/get-me.mjs
node examples/get-ticker.mjs
node examples/list-markets.mjs
CONFIRM_PLACE=1 node examples/place-paper-order.mjs
```

Local imports resolve via `file:..` in each example’s comment — after publish, `npm i @dogabot/sdk` and run the same scripts from any project.

Docs: https://docs.dogabot.com/sdk/
