package com.devui.ticketrush.order.stock;

/**
 * How we take tickets out of stock when many people buy at the same moment.
 * Chosen with app.order.stock-strategy (default ATOMIC). See NOTES.md "v2" for the measured comparison.
 */
public enum StockStrategy {

    /** v1 behaviour: read → check in Java → write. NOT safe. Kept only to demonstrate the bug. */
    NAIVE,

    /** SELECT ... FOR UPDATE: lock the row, then read/check/write. Others wait in line. */
    PESSIMISTIC,

    /** Compare-and-set with a version number; retry on conflict. No locks held while thinking. */
    OPTIMISTIC,

    /** One conditional UPDATE: "add if it still fits". The database does the check and the write together. */
    ATOMIC
}
