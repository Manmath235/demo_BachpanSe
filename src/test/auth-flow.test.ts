import { beforeEach, describe, expect, it } from "vitest";

import { useApp, findDemoAccount } from "@/lib/bachpanse/store";
import { seedData } from "@/lib/bachpanse/mock-data";

const DEMO_PHONE = "9876543210";

function freshAuthState() {
  useApp.setState({
    role: "none",
    session: { signedIn: false, phone: "" },
    account: { phone: DEMO_PHONE, role: "parent" },
    authMode: "login",
    stack: [{ screen: "loginPhone" }],
    direction: 1,
  });
}

describe("Login / sign-up flow", () => {
  beforeEach(freshAuthState);

  it("logs in with the registered phone straight into the parent dashboard", () => {
    const s = useApp.getState();
    expect(s.authMode).toBe("login");
    expect(s.account?.phone).toBe(DEMO_PHONE);

    s.signInStart(DEMO_PHONE);
    useApp.getState().signInComplete(useApp.getState().account!.role);
    useApp.getState().reset("parentHome");

    const now = useApp.getState();
    expect(now.session).toEqual({ signedIn: true, phone: DEMO_PHONE });
    expect(now.role).toBe("parent");
    expect(now.stack[0]!.screen).toBe("parentHome");
  });

  it("logs in with the demo child phone into the child dashboard", () => {
    const childPhone = "9876543211";
    useApp.getState().signInStart(childPhone);
    useApp.getState().signInComplete("child");
    useApp.getState().reset("childHome");

    const now = useApp.getState();
    expect(now.session).toEqual({ signedIn: true, phone: childPhone });
    expect(now.role).toBe("child");
    expect(now.stack[0]!.screen).toBe("childHome");
  });

  it("does not treat an unknown phone as registered in login mode", () => {
    const s = useApp.getState();
    const registered = s.account?.phone === "9111111111";
    expect(registered).toBe(false);
    expect(s.session.signedIn).toBe(false);
  });

  it("signing up records a new account with the chosen role", () => {
    const s = useApp.getState();
    s.signInStart("9222222222");
    useApp.getState().signInComplete("child");

    const now = useApp.getState();
    expect(now.account).toEqual({ phone: "9222222222", role: "child" });
    expect(now.role).toBe("child");
    expect(now.session.signedIn).toBe(true);
  });

  it("logout keeps the account so the user can log back in", () => {
    useApp.getState().signInStart(DEMO_PHONE);
    useApp.getState().signInComplete("parent");
    useApp.getState().logout();

    const now = useApp.getState();
    expect(now.session).toEqual({ signedIn: false, phone: "" });
    expect(now.role).toBe("none");
    expect(now.authMode).toBe("login");
    expect(now.account?.phone).toBe(DEMO_PHONE);
    expect(now.stack[0]!.screen).toBe("loginPhone");
  });

  it("demo numbers map to Aditya (parent) and Divya (child)", () => {
    expect(findDemoAccount("9876543210")).toEqual({
      phone: "9876543210",
      role: "parent",
    });
    expect(findDemoAccount("9876543211")).toEqual({
      phone: "9876543211",
      role: "child",
    });

    const d = seedData();
    expect(d.parentName).toBe("Aditya Sharma");
    expect(d.parentPhone).toBe("98765 43210");
    expect(d.childName).toBe("Divya Sharma");
    expect(d.childPhone).toBe("98765 43211");
  });

  it("logging in with a demo number restores the fresh demo family", () => {
    useApp.setState({
      data: { ...seedData(), parentName: "asgwrd", childName: "sgg" },
    });
    useApp.getState().signInStart(DEMO_PHONE);
    useApp.getState().signInComplete("parent");

    const d = useApp.getState().data;
    expect(d.parentName).toBe("Aditya Sharma");
    expect(d.childName).toBe("Divya Sharma");
  });

  it("logging in with a non-demo number keeps the user's own data", () => {
    useApp.setState({
      data: { ...seedData(), parentName: "My Parent" },
    });
    useApp.getState().signInStart("9222222222");
    useApp.getState().signInComplete("child");

    expect(useApp.getState().data.parentName).toBe("My Parent");
  });
});
