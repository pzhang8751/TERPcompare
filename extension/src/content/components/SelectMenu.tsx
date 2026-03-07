import {createClient} from '@supabase/supabase-js'

const supabase = createClient(
    "https://tkgwqavxwhzainixoqeg.supabase.co",
    "sb_publishable_FUpJQjqibUNFq-NBC3pK6Q_hO1WWY4a"
)

type Option = { label: string; value: string }

const debounce = (fn: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout>

    return (inputValue: string): Promise<Option[]> => {
        clearTimeout(timer)
        return new Promise(resolve => {
            timer = setTimeout(() => resolve(fn(inputValue)), delay)
        })
    }
}

const loadProfessors = debounce(async (inputValue: string): Promise<Option[]> => {
    const { data } = await supabase.from('professors').select('name').ilike('name', `%${inputValue}%`).limit(5);

    const results = data?.map(prof => ({ label: prof.name, value: prof.name })) ?? [];
    return [{ label: 'None', value: null }, ...results];
}, 300)

const loadCourses = debounce(async (inputValue: string): Promise<Option[]> => {
    const { data } = await supabase.from('courses').select('course_id').ilike('course_id', `%${inputValue}%`).limit(5);

    const results = data?.map(course => ({ label: course.course_id, value: course.course_id })) ?? [];
    return [{ label: 'None', value: null }, ...results];
}, 300)

export {loadProfessors, loadCourses}