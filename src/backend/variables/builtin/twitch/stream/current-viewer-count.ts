import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const logger = require("../../../../logwrapper");
const accountAccess = require("../../../../common/account-access");
const twitchApi = require("../../../../twitch-api/api");

const model : ReplaceVariable = {
    definition: {
        handle: "currentViewerCount",
        description: "Get the number of people viewing your stream.",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async () => {
        logger.debug("Getting number of viewers in chat for variable.");

        // get streamer user id
        const streamerId = accountAccess.getAccounts().streamer.userId;

        // retrieve stream data for user id
        const twitchClient = twitchApi.streamerClient;
        const streamInfo = await twitchClient.streams.getStreamByUserId(streamerId);

        // extract viewer count
        return streamInfo ? streamInfo.viewers : 0;
    }
};

export default model;
