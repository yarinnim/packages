
#!/usr/bin/env bash
 sed -i "16s/window.Store.SendSeen.sendSeen/window.Store.SendSeen.markSeen/" /usr/src/app/node_modules/whatsapp-web.js/src/util/Injected/Utils.js \
  && sed -i -f /usr/src/app/packages/whatsapp/patch/patch-utils-groupmetadata.sed /usr/src/app/node_modules/whatsapp-web.js/src/util/Injected/Utils.js \
  && patch "/usr/src/app/node_modules/whatsapp-web.js/src/Client.js" < /usr/src/app/packages/whatsapp/patch/patch-client.patch
