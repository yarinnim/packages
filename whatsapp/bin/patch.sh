#!/usr/bin/env bash
sed -i "16s/window.Store.SendSeen.sendSeen/window.Store.SendSeen.markSeen/" "../../node_modules/whatsapp-web.js/src/util/Injected/Utils.js" \
  && sed -i -f "../../packages/whatsapp/patch/patch-utils-groupmetadata.sed" "../../node_modules/whatsapp-web.js/src/util/Injected/Utils.js" \
  && patch "../../node_modules/whatsapp-web.js/src/Client.js" < "../../packages/whatsapp/patch/patch-client.patch"
