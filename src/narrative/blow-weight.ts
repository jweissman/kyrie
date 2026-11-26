// How hard a blow struck: all of it where it laid its mark low, not only what the mark had left to lose (the
// adventure branch's R81: a blow of 9 on a rat with 1 left had read "for 1", and a long fight's end as a scratch). The
// fight's telling and the ending's say it alike (OR-691: the fight's last blow "for 6", the ending's "for 2").
export class BlowWeight {
  static of(e: { amount?: number; rolled?: number; hp?: number }): number {
    return e.hp === 0 && (e.rolled ?? 0) > (e.amount ?? 0) ? e.rolled! : e.amount ?? 0;
  }
}
