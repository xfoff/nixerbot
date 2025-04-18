import { ReplaceVariable } from "../../../../../../types/variables";
import { EffectTrigger } from "../../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../../shared/variable-constants";

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
        handle: "chatMessageEmoteUrls",
        examples: [
            {
                usage: "chatMessageEmoteUrls[1]",
                description: "Get the url of a specific emote."
            }
        ],
        description: "Outputs the urls of a chat message's emotes from the associated command or event.",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger, target: null | string) => {
        let messageParts = [];
        if (trigger.type === EffectTrigger.COMMAND) {
            messageParts = trigger.metadata.chatMessage.parts;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageParts = trigger.metadata.eventData.chatMessage.parts;
        }

        const emoteUrls = messageParts.filter(p => p.type === "emote" || p.type === "third-party-emote").map(e => e.url);

        if (target != null) {
            return emoteUrls[target];
        }

        return emoteUrls;
    }
};

export default model;
