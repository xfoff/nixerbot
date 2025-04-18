import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";

const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = [
    "twitch:chat-message",
    "twitch:first-time-chat",
    "firebot:highlight-message",
    "twitch:viewer-arrived"
];

const model : ReplaceVariable = {
    definition: {
        handle: "userBadgeUrls",
        examples: [
            {
                usage: "userBadgeUrls[1]",
                description: "Get the URL of a chatter's selected badge image."
            }
        ],
        description: "Outputs the URLs of a chatter's selected badge images from the associated command or event.",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger, target: null | string = null) => {
        let messageParts = [];
        if (trigger.type === EffectTrigger.COMMAND) {
            messageParts = trigger.metadata.chatMessage.badges;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageParts = trigger.metadata.eventData.chatMessage.badges;
        }
        const badgeUrls = messageParts.map(e => e.url);

        if (target != null) {
            return badgeUrls[target];
        }

        return badgeUrls;
    }
};

export default model;