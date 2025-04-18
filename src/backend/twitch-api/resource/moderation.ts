import logger from '../../logwrapper';
import accountAccess from "../../common/account-access";
import { ApiClient, HelixBanUserRequest, HelixModerator, UserIdResolvable, extractUserId } from "@twurple/api";

export class TwitchModerationApi {
    private _streamerClient: ApiClient;
    private _botClient: ApiClient;

    constructor(streamerClient: ApiClient, botClient: ApiClient) {
        this._streamerClient = streamerClient;
        this._botClient = botClient;
    }

    /**
     * Determines if a user is timed out in the streamer's channel
     *
     * @param userId The user ID to check if they're timed out
     * @returns `true` if the user is timed out, or `false` if they're either banned indefinitely or not timed out
     */
    async isUserTimedOut(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            userId = extractUserId(userId);
            const response = await this._streamerClient.moderation.getBannedUsers(streamerId, {
                userId: [userId]
            });

            return response.data.some(b => b.userId === userId && b.expiryDate != null);
        } catch (error) {
            logger.error(`Error checking if user ${userId} is timed out`, error.message);
            return null;
        }
    }

    /**
     * Times out a user in the streamer's channel for a specified duration.
     *
     * @param userId The Twitch user ID of the user to timeout
     * @param duration The duration in seconds to timeout the user
     * @param reason The reason for the timeout
     * @returns `true` if the timeout was successful or `false` if it failed
     */
    async timeoutUser(
        userId: UserIdResolvable,
        duration: number,
        reason: string = null
    ): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            const timeoutRequest: HelixBanUserRequest = {
                user: userId,
                duration: duration,
                reason: reason
            };

            const response = await this._streamerClient.moderation.banUser(streamerId, timeoutRequest);

            return true;
        } catch (error) {
            logger.error("Error timing out user", error.message);
        }

        return false;
    }

    /**
     * Determines if a user is banned (not timed out) in the streamer's channel
     *
     * @param userId The user ID to check if they're banned
     * @returns `true` if the user is banned, or `false` if they're either not banned or only timed out
     */
    async isUserBanned(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            userId = extractUserId(userId);
            const response = await this._streamerClient.moderation.getBannedUsers(streamerId, {
                userId: [userId]
            });

            return response.data.some(b => b.userId === userId && b.expiryDate == null);
        } catch (error) {
            logger.error(`Error checking if user ${userId} is banned`, error.message);
            return null;
        }
    }

    /**
     * Bans a user from the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to ban
     * @param reason The reason for the ban
     * @returns `true` if the ban was successful or `false` if it failed
     */
    async banUser(userId: UserIdResolvable, reason: string = null): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            const banRequest: HelixBanUserRequest = {
                user: userId,
                duration: null,
                reason: reason
            };

            await this._streamerClient.moderation.banUser(streamerId, banRequest);

            return true;
        } catch (error) {
            logger.error("Error banning user", error.message);
        }

        return false;
    }

    /**
     * Unbans/removes the timeout for a user in the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to unban/remove from timeout
     * @returns `true` if the unban/removal from timeout was successful or `false` if it failed
     */
    async unbanUser(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            await this._streamerClient.moderation.unbanUser(streamerId, userId);

            return true;
        } catch (error) {
            logger.error("Error unbanning/removing timeout for user", error.message);
        }

        return false;
    }

    /**
     * Gets all the moderators in the streamer's channel.
     */
    async getModerators(): Promise<HelixModerator[]> {
        const moderators: HelixModerator[] = [];
        const streamerId = accountAccess.getAccounts().streamer?.userId;

        try {
            if (streamerId == null) {
                logger.warn("Unable to get channel moderator list. Streamer is not logged in.");
                return moderators;
            }

            moderators.push(...await this._streamerClient.moderation.getModeratorsPaginated(streamerId).getAll());
        } catch (error) {
            logger.error("Error getting moderators", error.message);
        }

        return moderators;
    }

    /**
     * Adds a moderator to the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to add as a mod
     * @returns `true` if the user was added as a mod successfully or `false` if it failed
     */
    async addChannelModerator(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            await this._streamerClient.moderation.addModerator(streamerId, userId);

            return true;
        } catch (error) {
            logger.error("Error adding moderator", error.message);
        }

        return false;
    }

    /**
     * Removes a moderator from the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to remove as a mod
     * @returns `true` if the user was removed as a mod successfully or `false` if it failed
     */
    async removeChannelModerator(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            await this._streamerClient.moderation.removeModerator(streamerId, userId);

            return true;
        } catch (error) {
            logger.error("Error removing moderator", error.message);
        }

        return false;
    }

    /**
     * Adds a VIP to the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to add as a VUP
     * @returns `true` if the user was added as a VUP successfully or `false` if it failed
     */
    async addChannelVip(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            await this._streamerClient.channels.addVip(streamerId, userId);
            return true;
        } catch (error) {
            logger.error("Error adding VIP", error.message);
        }

        return false;
    }

    /**
     * Removes a VIP from the streamer's channel.
     *
     * @param userId The Twitch user ID of the user to remove as a VIP
     * @returns `true` if the user was removed as a VIP successfully or `false` if it failed
     */
    async removeChannelVip(userId: UserIdResolvable): Promise<boolean> {
        const streamerId = accountAccess.getAccounts().streamer.userId;

        try {
            await this._streamerClient.channels.removeVip(streamerId, userId);
            return true;
        } catch (error) {
            logger.error("Error removing VIP", error.message);
        }

        return false;
    }
}