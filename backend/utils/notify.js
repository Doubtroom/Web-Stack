import Notification from "../models/Notification.js";
import { getIO } from "../sockets/index.js";

// Persist first, then emit: if the process dies between the two, the user
// still finds the notification in their inbox — a lost live ping is
// recoverable, a phantom one is not.
export const notify = async ({
  recipientId,
  actorId,
  type,
  questionId = null,
  answerId = null,
}) => {
  // Never notify people about their own actions.
  if (!recipientId || String(recipientId) === String(actorId)) {
    return null;
  }

  const notification = await Notification.create({
    recipient: recipientId,
    actor: actorId,
    type,
    questionId,
    answerId,
  });

  const populated = await notification.populate("actor", "displayName");

  const io = getIO();
  if (io) {
    io.to(String(recipientId)).emit("notification", populated);
  }

  return populated;
};
