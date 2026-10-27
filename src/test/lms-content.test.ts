import { beforeEach, describe, expect, it } from "vitest";

import {
  useApp,
  publishedLessons,
  publishedModules,
  modulePublishedCount,
} from "@/lib/bachpanse/store";
import { seedData } from "@/lib/bachpanse/mock-data";
import { seedContent } from "@/lib/bachpanse/content";

const DRAFT_LESSON_ID = "m6l1"; // seeded as the draft "Never share your OTP" in module 6

function freshData() {
  useApp.setState({ data: seedData() });
}

describe("LMS content shared with the child app", () => {
  beforeEach(freshData);

  it("seeds module 6 with two published lessons and one draft that the child never sees", () => {
    const data = useApp.getState().data;
    const pub = publishedLessons(data, 6);
    expect(pub.map((l) => l.title)).toEqual(["Spotting scams", "Your data is yours"]);
    const draft = data.content.lessons.find((l) => l.id === DRAFT_LESSON_ID);
    expect(draft?.title).toBe("Never share your OTP");
    expect(draft?.status).toBe("draft");
    expect(pub.some((l) => l.id === DRAFT_LESSON_ID)).toBe(false);
    expect(publishedModules(data).map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("publishing the draft makes it appear in the child's Learn tab", () => {
    useApp.getState().setLessonStatus(DRAFT_LESSON_ID, "published");
    const pub = publishedLessons(useApp.getState().data, 6);
    expect(pub.some((l) => l.id === DRAFT_LESSON_ID)).toBe(true);
    expect(modulePublishedCount(useApp.getState().data, 6)).toBe(3);
  });

  it("unpublishing a published lesson removes it from the child's Learn tab", () => {
    useApp.getState().setLessonStatus("m6l2", "draft");
    const pub = publishedLessons(useApp.getState().data, 6);
    expect(pub.some((l) => l.id === "m6l2")).toBe(false);
    expect(modulePublishedCount(useApp.getState().data, 6)).toBe(1);
  });

  it("lesson progress is capped at the number of published lessons", () => {
    // Module 6 has 2 published lessons, so completing lessons can't exceed 2.
    useApp.getState().completeLesson(6, 3);
    useApp.getState().completeLesson(6, 3);
    useApp.getState().completeLesson(6, 3);
    const data = useApp.getState().data;
    expect(data.modules.find((m) => m.id === 6)?.lessonsDone).toBe(2);
  });

  it("Reset demo data also resets the LMS content", () => {
    useApp.getState().setLessonStatus(DRAFT_LESSON_ID, "published");
    useApp.getState().updateLesson("m1l1", { title: "Edited in the LMS" });
    useApp.getState().updateChallenge("ch-shop", { budget: 999 });
    useApp.getState().resetDemo();

    const data = useApp.getState().data;
    expect(data.content).toEqual(seedContent());
    expect(data.content.lessons.find((l) => l.id === "m1l1")?.title).toBe("Money then and now");
    expect(data.content.challenges.find((c) => c.id === "ch-shop")?.budget).toBe(500);
  });
});
