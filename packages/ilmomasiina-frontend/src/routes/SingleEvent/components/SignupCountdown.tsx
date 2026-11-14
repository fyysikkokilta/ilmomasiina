import React from "react";

import { useSingleEventContext } from "@tietokilta/ilmomasiina-client";
import useNow from "../../../utils/useNow";
import SignupButton from "./SignupButton";

const SignupCountdown = () => {
  const { registrationOpens, localizedEvent: event } = useSingleEventContext();
  // Rerender every second until the signup has closed.
  const now = useNow(1000, !event?.registrationClosed);

  if (!event) return null;

  // Time until the signup opens, rounded up to whole seconds so that it only reaches zero once the signup is open.
  const total = Math.ceil(Math.max(0, (registrationOpens ?? now) - now) / 1000) * 1000;

  // The countdown follows the server's clock. Shift our clock by the same difference for the status text,
  // so that the text changes at the same moment as the button.
  const clockDifference =
    event.millisTillOpening && event.registrationStartDate && registrationOpens != null
      ? new Date(event.registrationStartDate).getTime() - registrationOpens
      : 0;

  return (
    <SignupButton
      isOpen={total === 0 && !event.registrationClosed}
      isClosed={event.registrationClosed}
      seconds={Math.floor(total / 1000) % 60}
      total={total}
      now={now + clockDifference}
    />
  );
};

export default SignupCountdown;
