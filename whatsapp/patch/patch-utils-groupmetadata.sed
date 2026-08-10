/await window\.Store\.GroupMetadata\.update(chatWid);/,/\.forEach(x => x\.contact.\.phoneNumber && (x\.id = x\.contact\.phoneNumber));/c\
            const updateGroupMetadata =\
                window.Store.GroupMetadata?.update ||\
                window.Store.GroupQueryAndUpdate ||\
                window.Store.GroupMetadataCollection?.update;\
            if (updateGroupMetadata) {\
                try {\
                    await updateGroupMetadata(chatWid);\
                } catch (_) {\
                    // best-effort; allow getChatModel to continue\
                }\
            }\
            const participants = chat.groupMetadata.participants?._models;\
            if (participants?.length) {\
                participants\
                    .filter(x => x.id?._serialized?.endsWith('@lid'))\
                    .forEach(x => x.contact?.phoneNumber && (x.id = x.contact.phoneNumber));\
            }
